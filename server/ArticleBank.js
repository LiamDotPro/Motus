/**
 * Created by li on 15/03/2017.
 */

var Article = require('./Article.js');
var mysql = require('promise-mysql');
var request = require('request-promise');

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
        this.pool.query('SELECT * FROM `articles`').then(function (rows) {
            for (var i in rows) {
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
        }).then(function () {
            self.loadedArticles = true;
            console.log('finished loading all articles from the database.');

            //immediately try to get new Sources as soon as the service is started.
            //self.getNewSources();
            //setInterval(self.getNewSources, 600000);
        });
    };

    this.getNewSources = function () {
        self.getBbcSources();
    };

    this.getBbcSources = function () {

        var poolRef = this.pool;

        request('https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b', function (error, response, body) {
            return body;
        }).then(function (json) {
            json = JSON.parse(json);

            var ChangedData = false;
            for (var i in json.articles) {
                if (!self.articles.has(json.articles[i].title)) {
                    //create new instance of articles in database.

                    var values = [json.articles[i].source, json.articles[i].author, json.articles[i].title, json.articles[i].description, json.articles[i].url, json.articles[i].urlToImage, json.articles[i].publishedAt, 'general'];
                    poolRef.query('INSERT INTO `articles` (source,author,title,articleDesc,url,urlToImage,publishedAt,category) VALUES (?,?,?,?,?,?,?,?)', values, function (error, result, fields) {
                    });

                    //Add the new article to the article bank.
                    var articleObj = new Article();
                    articleObj.setSource(json.articles[i].source);
                    articleObj.setAuthor(json.articles[i].author);
                    articleObj.setTitle(json.articles[i].title);
                    articleObj.setDesc(json.articles[i].description);
                    articleObj.setUrl(json.articles[i].url);
                    articleObj.setUrlToImage(json.articles[i].urlToImage);
                    articleObj.setPublishedAt(json.articles[i].publishedAt);
                    self.articles.set(json.articles[i].title, articleObj);

                    ChangedData = true;
                }
            }

            return ChangedData;
        }).then(function (res) {
            if (res === true) {
                console.log('New Articles for BBC added.');
            } else {
                console.log('No New Articles for BBC Added this round.');
            }
        });
    }

};

module.exports = ArticleBank;