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
        return this.pool.query('SELECT * FROM `articles` ORDER BY id DESC').then((rows) => {
            return rows
                .filter(row => !self.articles.has(row.title))
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
                    self.articles.set(row.title, articleObj);
                });
        }).catch(e => {
            console.log(e);
        });
    };

    this.StartCollectingArticles = function () {
        return this.getNewSources().then(() => {
            setInterval(self.getNewSources.bind(this), 600000);
        });
    };

    this.getNewSources = function () {
        return Promise.all([
            self.requestArticles('bbc-news', 'general', 'https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            self.requestArticles('bbc-sport', 'sport', 'https://newsapi.org/v1/articles?source=bbc-sport&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            self.requestArticles('techcrunch', 'technology', 'https://newsapi.org/v1/articles?source=techcrunch&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            self.requestArticles('abc-news', 'general', 'https://newsapi.org/v1/articles?source=abc-news-au&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            self.requestArticles('ars-technica', 'technology', 'https://newsapi.org/v1/articles?source=ars-technica&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            self.requestArticles('associated Press', 'general', 'https://newsapi.org/v1/articles?source=ars-technica&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b')
        ]).then(() => {
            self.loadedArticles = true;
            console.log('all sources updated');
        }).catch(e => {
            console.log(e);
        });
    };

    this.requestArticles = function (source, type, query) {
        return request(query).then((body) => {
            const json = JSON.parse(body);
            return Promise.all(
                json.articles
                    .filter(article => !self.articles.has(article.title))
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
     * Returns the status of the database in loading content.
     */
    this.getLoadedArticlesBool = function () {
        return this.loadedArticles;
    }

};

module.exports = ArticleBank;