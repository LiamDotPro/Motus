/**
 * Created by li on 28/03/2017.
 */
function Article() {

    this.id = 0;
    this.source = '';
    this.author = '';
    this.title = '';
    this.desc = '';
    this.url = '';
    this.urlToImage = '';
    this.publishedAt = '';
    this.articleScore = '';
    this.category = '';
    this.websafelink = '';

    this.getId = function () {
        return this.id;
    };

    this.getSource = function () {
        return this.source;
    };

    this.getAuthor = function () {
        return this.author;
    };

    this.getTitle = function () {
        return this.title;
    };

    this.getDesc = function () {
        return this.desc;
    };

    this.getUrl = function () {
        return this.url;
    };

    this.getUrlToImage = function () {
        return this.urlToImage;
    };

    this.getPublishedAt = function () {
        return this.publishedAt;
    };

    this.getArticleScore = function () {
        return this.articleScore;
    };

    this.setId = function (newId) {
        this.id = newId;
    };

    this.setSource = function (newSource) {
        this.source = newSource;
    };

    this.setAuthor = function (newAuthor) {
        this.author = newAuthor;
    };

    this.setTitle = function (newTitle) {
        this.title = newTitle;
    };

    this.setDesc = function (newDesc) {
        this.desc = newDesc;
    };

    this.setUrl = function (newUrl) {
        this.url = newUrl;
    };

    this.setUrlToImage = function (newUrlToImage) {
        this.urlToImage = newUrlToImage;
    };

    this.setPublishedAt = function (newPublishedAt) {
        this.publishedAt = newPublishedAt;
    };

    this.setArticleScore = function (newScore) {
        this.articleScore = newScore;
    };

    this.getCategory = function () {
        return this.category;
    };

    this.setCategory = function (newCat) {
        this.category = newCat;
    };

    this.setWebSafeLink = function (newLink) {
        this.websafelink = newLink;
    };

    this.getWebSafeLink = function () {
        return this.websafelink;
    };

}