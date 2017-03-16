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
        this.pool.query('SELECT * FROM `articles` ORDER BY id DESC').then(function (rows) {
            for (var i in rows) {
                if (!self.articles.has(rows[i].title)) {
                    var articleObj = new Article();
                    articleObj.setId(rows[i].id);
                    articleObj.setSource(rows[i].source);
                    articleObj.setAuthor(rows[i].author);
                    articleObj.setTitle(rows[i].title);
                    articleObj.setDesc(rows[i].articleDesc);
                    articleObj.setUrl(rows[i].url);
                    articleObj.setUrlToImage(rows[i].urlToImage);
                    articleObj.setPublishedAt(rows[i].publishedAt);
                    self.articles.set(rows[i].title, articleObj);
                }

            }
            self.loadedArticles = true;
        }).then(function () {
            console.log('finished loading all articles from the database.');
        });
    };

    this.StartCollectingArticles = function () {
        self.getNewSources();
        setInterval(self.getNewSources, 600000);
    };

    this.getNewSources = function () {
        //self.getBbcSources();

        //bbc-news
        self.requestArticles('bbc-news', 'general', 'https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b');

        //bbc-sport
        self.requestArticles('bbc-sport', 'sport', ' https://newsapi.org/v1/articles?source=bbc-sport&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b');

        //techcrunch
        self.requestArticles('techcrunch', 'technology', 'https://newsapi.org/v1/articles?source=techcrunch&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b');
    };

    function insertArticleData(json, pool) {
        var poolRef = pool;

    }

    this.requestArticles = function (source, type, query) {
        var poolRef = this.pool;

        request(query, function (error, response, body) {
            return body;
        }).then(function (json) {
            json = JSON.parse(json);
            var ChangedData = false;
            for (var i in json.articles) {
                if (!self.articles.has(json.articles[i].title)) {
                    //create new instance of articles in database.

                    self.loadedArticles = false;

                    var values = [json.source, json.articles[i].author, json.articles[i].title, json.articles[i].description, json.articles[i].url, json.articles[i].urlToImage, json.articles[i].publishedAt, type];
                    poolRef.query('INSERT INTO `articles` (source,author,title,articleDesc,url,urlToImage,publishedAt,category) VALUES (?,?,?,?,?,?,?,?)', values, function (error, result, fields) {
                    });

                    ChangedData = true;
                }
            }

            if (ChangedData === true) {
                console.log('New Articles for ' + source + ' added.');
                self.loadArticlesFromDatabase();
            } else {
                console.log('No New Articles for ' + source + ' Added this round.');
            }

        });
    };

    /**
     * Returns the status of the database in loading contant.
     */
    this.getLoadedArticlesBool = function () {
        return this.loadedArticles;
    }

};

module.exports = ArticleBank;