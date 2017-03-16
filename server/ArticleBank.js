/**
 * Created by li on 15/03/2017.
 */

var Article = require('./Article.js');

var ArticleBank = function () {

    var self = this;

    this.articles = [];
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

    this.setPool = function (poolRef) {
        this.pool = poolRef;
    };

    this.loadArticlesFromDatabase = function () {
        this.pool.query('SELECT * FROM `articles`').then(function (rows) {
            for (var i in rows) {
                var articleObj = new Article();
                articleObj.setSource(rows[i].source);
                articleObj.setAuthor(rows[i].author);
                articleObj.setTitle(rows[i].title);
                articleObj.setDesc(rows[i].desc);
                articleObj.setUrl(rows[i].url);
                articleObj.setUrlToImage(rows[i].urlToImage);
                articleObj.publishedAt(rows[i].publishedAt);
                self.articles.push(articleObj);
            }
        }).then(function () {
            self.loadedArticles = true;
            console.log('finished loading all articles from the database.');
            self.getNewSources();
        });
    };

    this.getNewSources = function () {

    }

};

module.exports = ArticleBank;