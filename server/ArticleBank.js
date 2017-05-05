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

        this.getArticlesSize = () => {
            return this.articleCount;
        };

        this.setPool = function (poolRef) {
            this.pool = poolRef;
        };

        this.StartCollectingArticles = function (sourceMap) {
            this.setSourceMap(sourceMap);
            return this.getNewSources().then(() => {
                setInterval(self.getNewSources.bind(this), 600000);
            }).then(() => {
                this.queryForSize().then((res) => {
                    console.log("Articles Loaded this round: " + res);
                });
            });
        };

        this.queryForSize = function () {
            return this.pool.query("SELECT COUNT(*) FROM `articles`;").then((rows) => {
                this.articleCount = rows[0]['COUNT(*)'];
                return rows[0]['COUNT(*)'];
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
                bar.tick();
            }

            let promiseArr = [];
            for (let x of this.getSourceMap().values()) {
                promiseArr.push(this.requestArticles(x.getName(), x.getCat(), x.getKey()).then(value => {
                    updateProgressBar();
                }));
            }

            return Promise.all(promiseArr).then((res) => {1
                this.loadedArticles = true;
                this.queryForSize().then((res) => {
                    console.log(res);
                });
            }).catch(e => {
                console.log(e);
            });
        };

        this.requestArticles = function (source, type, query) {
            return request(query).then((body) => {
                const json = JSON.parse(body);
                if (json.status !== "ok") {
                    Console.log(json.source + "Failed Response.");
                }

                let promiseArr = [];

                for (let i of json.articles) {
                    promiseArr.push(checkValueWith(i));
                }

                checkAllValues(promiseArr).then((res) => {

                    let articleArr = res.filter(function (obj) {
                        return obj.found !== true;
                    });

                    return Promise.all(
                        articleArr
                            .map(article => {

                                let desc, title;

                                if (article.articleData.description != null) {
                                    desc = article.articleData.description.replace(/[^\x20-\x7E]+/g, '');
                                }

                                if (article.title !== null) {
                                    title = article.articleData.title.replace(/[^\x20-\x7E]+/g, '');
                                }else{
                                    console.log("title: " + article.articleData.title);
                                }

                                const values = [json.source, article.articleData.author, title, desc, article.articleData.url, article.articleData.urlToImage, article.articleData.publishedAt, type, 0, createWebSafeLink(title)];
                                return this.pool.query('INSERT INTO `articles` (source,author,title,articleDesc,url,urlToImage,publishedAt,category,articleScore,webSafeLink) VALUES (?,?,?,?,?,?,?,?,?,?)', values);
                            })
                    );
                });
            });
        };


        /**
         * Filter new articles based on if description and image may also be the same.
         * @param articleData
         * @returns {boolean}
         */
        function checkValueWith(articleData) {
            return self.pool.query('Select * from `articles` WHERE title=? OR url=? COLLATE utf8_general_ci;', [articleData.title, articleData.url]).then((res) => {
                if (res.length > 0) {
                    return {articleData, found: true};
                } else {
                    return {articleData, found: false};
                }
            });
        }

        function checkAllValues(arr) {
            return Promise.all(arr).then((res) => {
                return res;
            });
        }

        function getSourceRecords(sourceName) {
            return self.pool.query('Select * from `articles` where source=?', [sourceName]).then((rows) => {
                const tempArr = [];

                for (var i in rows) {
                    const articleObj = new Article();
                    articleObj.setId(rows[i].id);
                    articleObj.setSource(rows[i].source);
                    articleObj.setAuthor(rows[i].author);
                    articleObj.setTitle(rows[i].title);
                    articleObj.setDesc(rows[i].articleDesc);
                    articleObj.setUrl(rows[i].url);
                    articleObj.setUrlToImage(rows[i].urlToImage);
                    articleObj.setPublishedAt(rows[i].publishedAt);
                    articleObj.setArticleScore(rows[i].articleScore);
                    articleObj.setCategory(rows[i].category);
                    articleObj.setWebSafeLink(rows[i].webSafeLink);

                    tempArr.push(articleObj);
                }

                return tempArr;
            });
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

        this.queryArticleByLink = (link, socket) => {
            this.pool.query('SELECT * FROM `articles` WHERE webSafeLink="' + link + '";').then(function (rows) {
                for (var i in rows) {
                    const articleObj = new Article();
                    articleObj.setId(rows[i].id);
                    articleObj.setSource(rows[i].source);
                    articleObj.setAuthor(rows[i].author);
                    articleObj.setTitle(rows[i].title);
                    articleObj.setDesc(rows[i].articleDesc);
                    articleObj.setUrl(rows[i].url);
                    articleObj.setUrlToImage(rows[i].urlToImage);
                    articleObj.setPublishedAt(rows[i].publishedAt);
                    articleObj.setArticleScore(rows[i].articleScore);
                    articleObj.setCategory(rows[i].category);
                    articleObj.setWebSafeLink(rows[i].webSafeLink);

                    socket.emit('recSingleArticle', {
                        article: articleObj
                    });

                }
            });
        };

        this.queryForMoreArticles = (id, socket) => {
            this.pool.query('SELECT * FROM articles WHERE id < ' + id + ' order by id DESC limit 100;').then(function (rows) {

                const tempArr = [];

                for (var i in rows) {
                    const articleObj = new Article();
                    articleObj.setId(rows[i].id);
                    articleObj.setSource(rows[i].source);
                    articleObj.setAuthor(rows[i].author);
                    articleObj.setTitle(rows[i].title);
                    articleObj.setDesc(rows[i].articleDesc);
                    articleObj.setUrl(rows[i].url);
                    articleObj.setUrlToImage(rows[i].urlToImage);
                    articleObj.setPublishedAt(rows[i].publishedAt);
                    articleObj.setArticleScore(rows[i].articleScore);
                    articleObj.setCategory(rows[i].category);
                    articleObj.setWebSafeLink(rows[i].webSafeLink);

                    tempArr.push(articleObj);
                }

                return tempArr;
            }).then((arr) => {
                console.log("sent " + arr.length + " more articles");
                socket.emit('recFurtherArticles', {
                    arr: arr
                });
            });
        };

        this.getAllArticles = () => {
            return this.pool.query("Select * from `Articles`").then(function (rows) {
                const tempArr = [];

                for (let i in rows) {
                    const articleObj = new Article();
                    articleObj.setId(rows[i].id);
                    articleObj.setSource(rows[i].source);
                    articleObj.setAuthor(rows[i].author);
                    articleObj.setTitle(rows[i].title);
                    articleObj.setDesc(rows[i].articleDesc);
                    articleObj.setUrl(rows[i].url);
                    articleObj.setUrlToImage(rows[i].urlToImage);
                    articleObj.setPublishedAt(rows[i].publishedAt);
                    articleObj.setArticleScore(rows[i].articleScore);
                    articleObj.setCategory(rows[i].category);
                    articleObj.setWebSafeLink(rows[i].webSafeLink);

                    tempArr.push(articleObj);
                }

                return tempArr;
            });
        };

        this.getLatestID = (id) => {
            return this.pool.query("Select * from `articles` Where id > " + id + ";").then((rows) => {
                const tempArr = [];

                for (let i in rows) {
                    const articleObj = new Article();
                    articleObj.setId(rows[i].id);
                    articleObj.setSource(rows[i].source);
                    articleObj.setAuthor(rows[i].author);
                    articleObj.setTitle(rows[i].title);
                    articleObj.setDesc(rows[i].articleDesc);
                    articleObj.setUrl(rows[i].url);
                    articleObj.setUrlToImage(rows[i].urlToImage);
                    articleObj.setPublishedAt(rows[i].publishedAt);
                    articleObj.setArticleScore(rows[i].articleScore);
                    articleObj.setCategory(rows[i].category);
                    articleObj.setWebSafeLink(rows[i].webSafeLink);

                    tempArr.push(articleObj);
                }

                return tempArr;
            })
        };
    };

module.exports = ArticleBank;