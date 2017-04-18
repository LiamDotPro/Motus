/**
 * Created by li on 18/04/2017.
 */

function User() {

    this.id = 0;
    this.email = '';
    this.admin = {};
    this.canvasData = {};
    this.pinnedArticles = [];

    this.setArticleObjects = (arrayOfArticleObjects) => {
        this.pinnedArticles = this.convertToArticle(arrayOfArticleObjects);
    };

    /**
     * used to create article objects from objects no assigned as an article.
     * @param arrayOfNonArticleData
     */
    this.convertToArticle = (arrayOfNonArticleData) => {
        let tempArr = [];
        for (let x = 0; x < arrayOfNonArticleData.length; x++) {
            let tempArticle = new Article();
            tempArticle.setTitle(arrayOfNonArticleData[x].title);
            tempArticle.setWebSafeLink(arrayOfNonArticleData[x].websafelink);
            tempArr.push(tempArticle);
        }

        return tempArr;
    };


    this.getPinnedArticles = () => {
        return this.pinnedArticles;
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

    this.getPinnedArticlesAsJson = () => {
        return JSON.stringify(this.pinnedArticles);
    };

}