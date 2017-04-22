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

    this.StartCollectingArticles = function () {
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
            this.requestArticles('bloomberg', 'business', 'https://newsapi.org/v1/articles?source=bloomberg&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('Business Insider', 'business', ' https://newsapi.org/v1/articles?source=business-insider&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('business Insider (UK)', 'business', 'https://newsapi.org/v1/articles?source=business-insider-uk&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('buzzfeed', 'entertainment', 'https://newsapi.org/v1/articles?source=buzzfeed&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('recode', 'technology', 'https://newsapi.org/v1/articles?source=recode&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('national-geographic', 'science-and-nature', 'https://newsapi.org/v1/articles?source=national-geographic&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('the-wall-street-journal', 'business', 'https://newsapi.org/v1/articles?source=the-wall-street-journal&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('google-news', 'general', 'https://newsapi.org/v1/articles?source=google-news&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('mtv-news-uk', 'music', 'https://newsapi.org/v1/articles?source=mtv-news-uk&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('new-york-magazine', 'general', 'https://newsapi.org/v1/articles?source=new-york-magazine&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('the-huffington-post', 'general', 'https://newsapi.org/v1/articles?source=the-huffington-post&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('the-lad-bible', 'entertainment', 'https://newsapi.org/v1/articles?source=the-lad-bible&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('al-jazeera-english', 'general', 'https://newsapi.org/v1/articles?source=al-jazeera-english&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('associated-press', 'general', 'https://newsapi.org/v1/articles?source=associated-press&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('breitbart-news', 'general', 'https://newsapi.org/v1/articles?source=breitbart-news&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('cnbc', 'business', 'https://newsapi.org/v1/articles?source=cnbc&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('cnn', 'general', 'https://newsapi.org/v1/articles?source=cnn&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('daily-mail', 'entertainment', 'https://newsapi.org/v1/articles?source=daily-mail&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('engadget', 'technology', 'https://newsapi.org/v1/articles?source=engadget&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('entertainment-weekly', 'entertainment', 'https://newsapi.org/v1/articles?source=entertainment-weekly&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('espn', 'sport', 'https://newsapi.org/v1/articles?source=espn&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('espn-cric-info', 'sport', 'https://newsapi.org/v1/articles?source=espn-cric-info&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('financial-times', 'business', 'https://newsapi.org/v1/articles?source=financial-times&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('fortune', 'business', 'https://newsapi.org/v1/articles?source=fortune&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('four-four-two', 'sport', 'https://newsapi.org/v1/articles?source=four-four-two&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('fox-sports', 'sport', 'https://newsapi.org/v1/articles?source=fox-sports&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('ign', 'gaming', 'https://newsapi.org/v1/articles?source=ign&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('independent', 'general', 'https://newsapi.org/v1/articles?source=independent&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('mashable', 'entertainment', 'https://newsapi.org/v1/articles?source=mashable&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('metro', 'general', 'https://newsapi.org/v1/articles?source=metro&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('mirror', 'general', 'https://newsapi.org/v1/articles?source=mirror&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('mtv-news', 'music', 'https://newsapi.org/v1/articles?source=mtv-news&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('new-scientist', 'science-and-nature', 'https://newsapi.org/v1/articles?source=new-scientist&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('newsweek', 'general', 'https://newsapi.org/v1/articles?source=newsweek&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('nfl-news', 'sport', 'https://newsapi.org/v1/articles?source=nfl-news&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('polygon', 'gaming', 'https://newsapi.org/v1/articles?source=polygon&sortBy=top&apiKey=cfe8990468894b4a96882692c13f063b'),
            this.requestArticles('talksport', 'sport', 'https://newsapi.org/v1/articles?source=talksport&sortBy=latest&apiKey=cfe8990468894b4a96882692c13f063b')
        ]).then(() => {
            console.log("Articles loaded this round: " + this.articles.size);
            this.loadedArticles = true;
            console.log('all sources updated');
            console.log(this.articleCount);
            console.log(this.articles.size);

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