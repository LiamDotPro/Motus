/**
 * Created by li on 15/03/2017.
 */

var Article = require('./Article.js');
var mysql = require('promise-mysql');
var request = require('request-promise');
var Promise = require("bluebird");
var ProgressBar = require('progress');

var ArticleBank = function () {

    var self = this;

    this.articles = new Map();
    this.articleCount = 0;
    this.tags = ['general', 'technology', 'sport', 'business', 'entertainment', 'music', 'science-and-nature', 'gaming'];
    this.pool = null;
    this.loadedArticles = false;
    this.sourceMap = null;

    /**
     * Sets the source list.
     * @param newSourceMap
     */
    this.setSourceMap = (newSourceMap) => {
        this.sourceMap = newSourceMap;
    };

    /**
     * Gets the current map of sources.
     * @returns {null|*}
     */
    this.getSourceMap = () => {
        return this.sourceMap;
    };

    /**
     * Ref to self which can be used in context inside the outer lexical scope.
     * @returns {DataStore}
     */
    this.getSelf = function () {
        return self;
    };

    this.getAllArticles = function () {
        return this.articles;
    };

    this.setPool = function (poolRef) {
        this.pool = poolRef;
    };

    this.loadArticlesFromDatabase = function () {
        return this.pool.query('SELECT * FROM `articles` ORDER BY id DESC').then((rows) => {
            return rows
                .filter(row => !this.articles.has(row.title))
                .map((row) => {
                    const articleObj = new Article();
                    articleObj.setId(row.id);
                    articleObj.setSource(row.source);
                    articleObj.setAuthor(row.author);
                    articleObj.setTitle(row.title);
                    articleObj.setDesc(row.articleDesc);
                    articleObj.setUrl(row.url);
                    articleObj.setUrlToImage(row.urlToImage);
                    articleObj.setPublishedAt(row.publishedAt);
                    articleObj.setArticleScore(row.articleScore);
                    articleObj.setCategory(row.category);
                    articleObj.setWebSafeLink(row.webSafeLink);
                    this.articles.set(row.title, articleObj);
                });
        }).catch(e => {
            console.log(e);
        });
    };

    this.StartCollectingArticles = function (sourceMap) {
        this.setSourceMap(sourceMap);
        return this.getNewSources().then(() => {
            setInterval(self.getNewSources.bind(this), 600000);
        }).then(() => {
            this.articleCount = this.articles.size;
        });
    };

    this.getNewSources = function () {
        var bar = new ProgressBar('0% :bar :percent', {total: this.getSourceMap().size});
        var timer = setInterval(function () {
            if (bar.complete) {
                clearInterval(timer);
            }
        }, 50);

        function updateProgressBar() {
            bar.tick()
        }

        let promiseArr = [];
        for (let x of this.getSourceMap().values()) {
            promiseArr.push(this.requestArticles(x.getName(), x.getCat(), x.getKey()).then(value => {
                updateProgressBar();
                return value;
            }));
        }

        return Promise.all(promiseArr).then(() => {
            console.log("Articles loaded this round: " + this.articles.size);
            this.loadedArticles = true;
        }).catch(e => {
            console.log(e);
        });
    };

    this.logDataSet = function () {
        console.log(this.getAllArticles().size);
    };

    this.requestArticles = function (source, type, query) {
        return request(query).then((body) => {
            const json = JSON.parse(body);
            return Promise.all(
                json.articles
                    .filter(article => !self.articles.has(article.title) && checkValueWith(article))
                    .map(article => {
                        var desc;
                        if (article.description != null) {
                            desc = article.description.replace(/[^\x20-\x7E]+/g, '');
                        }
                        const values = [json.source, article.author, article.title, desc, article.url, article.urlToImage, article.publishedAt, type, 0, createWebSafeLink(article.title)];
                        return this.pool.query('INSERT INTO `articles` (source,author,title,articleDesc,url,urlToImage,publishedAt,category,articleScore,webSafeLink) VALUES (?,?,?,?,?,?,?,?,?,?)', values);
                    })
            ).then(() => {
                    self.loadArticlesFromDatabase();
                }
            );
        }).catch(e => {
            console.log(e);
        });
    };

    /**
     * Filter new articles based on if description and image may also be the same.
     * @param articleData
     * @returns {boolean}
     */
    function checkValueWith(articleData) {
        for (var [key, value] of self.articles) {
            if (value.getPublishedAt() === articleData.publishedAt && value.getUrl() === articleData.url) {
                return false;
            }
        }
        return true;
    }

    function createWebSafeLink(str) {
        var tempStr = str.toLowerCase();

        //remove unsafe apostrophes
        tempStr = tempStr.replace(/'/g, "");
        tempStr = tempStr.replace(/"/g, "");

        //remove spacing and return web safe link.
        return tempStr.replace(/ /g, "-");
    }


    /**
     * Returns the status of the database in loading content.
     */
    this.getLoadedArticlesBool = function () {
        return this.loadedArticles;
    };


};

module.exports = ArticleBank;