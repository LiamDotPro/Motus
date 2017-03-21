/**
 * Created by li on 15/03/2017.
 */

var Article = require('./Article.js');
var mysql = require('promise-mysql');
var request = require('request-promise');
var Promise = require("bluebird");

var ArticleBank = function () {

    var self = this;

    this.articles = new Map();
    this.articleCount = 0;
    this.tags = ['general', 'technology', 'sport', 'business', 'entertainment', 'music', 'science-and-nature', 'gaming'];
    this.pool = null;
    this.loadedArticles = false;

    /**
     * Ref to self which can be used in context inside the outer lexical scope.
     * @returns {dataStore}
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
                    this.articles.set(row.title, articleObj);
                });
        }).catch(e => {
            console.log(e);
        });
    };

    this.StartCollectingArticles = function () {
        console.log("started collecting stuff");
        return this.getNewSources().then(() => {
            setInterval(self.getNewSources.bind(this), 600000);
        }).then(() => {
            this.articleCount = this.articles.size;
        });
    };

    this.getNewSources = function () {
        return Promise.all([
            this.requestArticles('bbc-news', 'general', 'https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('bbc-sport', 'sport', 'https://newsapi.org/v1/articles?source=bbc-sport&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('techcrunch', 'technology', 'https://newsapi.org/v1/articles?source=techcrunch&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('abc-news', 'general', 'https://newsapi.org/v1/articles?source=abc-news-au&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('ars-technica', 'technology', 'https://newsapi.org/v1/articles?source=ars-technica&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('associated Press', 'general', 'https://newsapi.org/v1/articles?source=ars-technica&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b')
        ]).then(() => {
            console.log("Articles loaded this round: " + this.articles.size);
            this.loadedArticles = true;
            console.log('all sources updated');

            console.log(this.articleCount);
            console.log(this.articles.size);

            //checking to see if new articles have been loaded, if articles are still not loaded a 0 will be there first round.
            if (this.articleCount < this.articles.size && this.articleCount !== 0) {
                //sending clients new sources discovered.

                var arrOfNewArticles = [];
                var counter = Math.abs(this.articles.size - this.articleCount);
                for (var [key, value] of this.articles.entries()) {
                    if (counter === 0) {
                        return;
                    } else {
                        arrOfNewArticles.push(value);
                        counter--;
                    }
                }
                console.log(arrOfNewArticles);
            }

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
                        const values = [json.source, article.author, article.title, article.description, article.url, article.urlToImage, article.publishedAt, type, 0];
                        return this.pool.query('INSERT INTO `articles` (source,author,title,articleDesc,url,urlToImage,publishedAt,category,articleScore) VALUES (?,?,?,?,?,?,?,?,?)', values);
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
        for (var [key, value] of ) {

        }
        return true;
    }

    /**
     * Returns the status of the database in loading content.
     */
    this.getLoadedArticlesBool = function () {
        return this.loadedArticles;
    }

};

module.exports = ArticleBank;