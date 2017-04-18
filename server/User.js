/**
 * Created by li on 30/03/2017.
 */

var User = function () {

    this.id = 0;
    this.email = '';
    this.admin = {};
    this.canvasData = {};
    this.pinnedArticles = [];

    this.getPinnedArticles = () => {
        return this.pinnedArticles;
    };

    this.setPinnedArticles = (articleJSON) => {
        this.pinnedArticles = JSON.parse(articleJSON);
    };

    this.addPinnedArticle = (article) => {
        this.pinnedArticles.push(article);
    };

    this.getId = () => {
        return this.id;
    };

    this.getEmail = () => {
        return this.email;
    };

    this.getAdmin = () => {
        return this.admin;
    };

    this.getCanvasData = () => {
        return this.canvasData;
    };

    this.setId = (newId) => {
        this.id = newId;
    };

    this.setEmail = (newEmail) => {
        this.email = newEmail;
    };

    this.setAdmin = (newAdminObj) => {
        this.admin = newAdminObj;
    };

    this.setCanvasData = (newCanvasDataObj) => {
        this.canvasData = newCanvasDataObj;
    };

    /**
     * Sets a new status for the user.
     * @param newStatus
     */
    this.setStatus = (newStatus) => {
        this.status = newStatus;
    };

    this.getPinnedArticlesAsJson = () =>{
      return JSON.stringify(this.pinnedArticles);
    };
};

module.exports = User;