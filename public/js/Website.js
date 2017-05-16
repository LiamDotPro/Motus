/**
 * Created by li on 28/03/2017.
 */


function Website(socket) {

    var self = this;
    this.articleList = [];
    this.loadedArticleIds = [];
    this.unloadedArticles = [];
    this.searchArticles = [];
    this.currentViewType = 'list';
    this.scrolling = false;
    this.loadCount = 0;
    this.lastId = 0;
    this.firstId = 0;
    this.learning = new LearningAlgorithm(socket);

    this.getLearning = () => {
        return this.learning;
    };

    this.sortByLearning = () => {
        this.articleList = this.learning.orderDataBasedOnValues(this.articleList);
    };

    this.setArticleList = function (arrOfArticles) {
        this.articleList = arrOfArticles;
        this.lastId = this.articleList[this.articleList.length - 1].getId();
        this.firstId = this.articleList[0].getId();
    };

    this.getArticleList = function () {
        return this.articleList;
    };

    /**
     * Initial load function that loads articles into the dom
     */
    this.websiteLoadArticles = function (amount) {

        //stop loader.
        $('#loader').css('display', 'block');

        //load normal logo
        $('#logo').addClass('hidden');

        const newsHub = document.getElementById("news-hub");

        var x = 0;

        //add all of the new articles to the page
        for (var i = this.loadedArticleIds.length; x < amount; x++) {
            if (this.articleList.length != i) {
                if (this.currentViewType === 'tile') {
                    this.loadedArticleIds.push(this.articleList[i].getId());
                    newsHub.innerHTML = newsHub.innerHTML + ' <div id="article' + this.articleList[i].getId() + '" class="col-md-6 news-tile-half article"><div class="news-tile"><div class="news-tile-controls row"><div class="col-md-6 control-button news-tile-controls-votes"> <a href=""> <i class="fa fa-chevron-up" aria-hidden="true"></i> </a> <span class="vote-amounts">' + this.articleList[i].getArticleScore() + '</span> <a href=""> <i class="fa fa-chevron-down" aria-hidden="true"></i> </a> </div><div class="col-md-6 control-button news-tile-controls-pin text-right"> <a class="control-icon pushpin" href=""><i id="' + this.articleList[i].getId() + '" class="fa fa-thumb-tack "></i></a> </div> </div> <div class="news-tile-image row"> <div class="col-md-12"><div class="news-tile-img-col"><img src="' + checkImageForNull(this.articleList[i].getUrlToImage()) + '" class="img-responsive"></div> </div> </div> <div class="news-tile-info row"> <div class="col-md-12"> <a class="news-tile-info-wrap article-link" href="' + createNavSafeLink(this.articleList[i].getTitle()) + '"> <span class="news-time-date">' + this.articleList[i].getSource() + ' | ' + this.articleList[i].getPublishedAt() + ' | ' + this.articleList[i].getCategory() + ' </span> <h2>' + this.articleList[i].getTitle() + '</h2> </a> </div> </div> </div> </div>';
                    i++;
                } else {
                    this.loadedArticleIds.push(this.articleList[i].getId());
                    newsHub.innerHTML = newsHub.innerHTML + ' <div id="article' + this.articleList[i].getId() + '" class="col-md-12 article"><div class="news-tile"><div class="news-tile-controls row"><div class="col-md-6 control-button news-tile-controls-votes"> <a  href=""> <i class="fa fa-chevron-up" aria-hidden="true"></i> </a> <span class="vote-amounts">' + this.articleList[i].getArticleScore() + '</span> <a href=""> <i class="fa fa-chevron-down" aria-hidden="true"></i> </a> </div><div class="col-md-6 control-button news-tile-controls-pin text-right"> <a class="control-icon pushpin" href=""><i id="' + this.articleList[i].getId() + '" class="fa fa-thumb-tack "></i></a> </div> </div> <div class="news-tile-image row"> <div class="col-md-12"><div class="news-tile-img-col"><img src="' + checkImageForNull(this.articleList[i].getUrlToImage()) + '" class="img-responsive"></div> </div> </div> <div class="news-tile-info row"> <div class="col-md-12"> <a class="news-tile-info-wrap article-link" href="' + createNavSafeLink(this.articleList[i].getTitle()) + '"> <span class="news-time-date">' + this.articleList[i].getSource() + ' | ' + this.articleList[i].getPublishedAt() + ' | ' + this.articleList[i].getCategory() + ' </span> <h2>' + this.articleList[i].getTitle() + '</h2> </a> </div> </div> </div> </div>';
                    i++;
                }
            }
            this.loadCount++;
        }

        if (this.loadCount > 98) {

            this.loadCount = 0;

            console.log("found load amount");

            socket.emit('getFurtherArticles', {
                lastId: this.articleList[this.articleList.length - 1].getId()
            })
        }

        //Set time out to let dom elements render efficiently.
        setTimeout(function () {
            //stop loader.
            $('#loader').css('display', 'none');

            //load normal logo
            $('#logo').removeClass('hidden');
        }, 300);

        //Hide the loading div once articles are loaded into the DOM.
        $('#loading-div').addClass("hidden");


    };

    function createNavSafeLink(str) {
        var tempStr = str.toLowerCase();

        //remove unsafe apostrophes
        tempStr = tempStr.replace(/'/g, "");
        tempStr = tempStr.replace(/"/g, "");

        //remove spacing and return web safe link.
        return tempStr.replace(/ /g, "-");

    }

    /**
     * Checks to see if an image string is null, if true returns the default image.
     */
    function checkImageForNull(imageString) {
        if (imageString === null) {
            return 'public/images/default/news/default1.jpg';
        } else {
            return imageString;
        }
    }

    /**
     * Sets the current view type for the website (Tiles / List view).
     */
    this.setCurrentViewType = function (newType) {
        this.currentViewType = newType;
    };

    this.setupArticleCollector = function (socket) {
        setInterval(function () {

            var currentId;

            if (self.getUnloadedArticles().length > 0) {
                currentId = self.getUnloadedArticles()[self.getUnloadedArticles().length - 1].id;
            } else {
                currentId = self.firstId;
            }

            console.log(currentId);

            socket.emit('checkForNewArticles', {
                latestId: currentId
            });
        }, 60000);
    };

    /**
     * Sorts the current article list by ID - Id is the newest article within the database.
     */
    this.sortArticlesById = () => {
        this.articleList.sort(function (a, b) {
            return b.id - a.id;
        });
    };

    /**
     * Sorts the Unloaded articles by ID - Id is the newest article within the database.
     */
    this.sortUnloadedArticlesById = () => {
        this.unloadedArticles.sort(function (a, b) {
            return a.id - b.id;
        });
    };

    this.pushNewArticle = (newArticle) => {
        this.unloadedArticles.push(newArticle);
    };

    this.pushFurtherArticle = (article) => {
        this.articleList.push(article);
    };

    this.getUnloadedArticles = () => {
        return this.unloadedArticles;
    };

    this.configureNewsLabel = () => {
        if (this.unloadedArticles.length > 0) {
            //configure label to show how many items we have to load.
            $('#news-notification-label').removeClass('hidden');
            $('#news-notification-label').text(this.unloadedArticles.length);

            document.title = "(" + this.unloadedArticles.length + ")" + " Motus";

            $('#refresh-btn').css("color", "#000");
        } else {
            //no new articles to be pushed.
            $('#news-notification-label').addClass('hidden');
            $('#refresh-btn').css("color", "#dcdcdc");

            document.title = "Motus";
        }
    };

    /**
     * Loads articles from the unloaded articles into the news hub.
     */
    this.loadNewArticles = () => {

        this.sortUnloadedArticlesById();

        const newsHub = document.getElementById("news-hub");

        if (this.unloadedArticles.length > 0) {
            for (var x in this.unloadedArticles) {
                if (this.currentViewType === 'tile') {
                    newsHub.innerHTML = ' <div id="article' + this.unloadedArticles[x].getId() + '" class="col-md-6 news-tile-half article"><div class="news-tile"><div class="news-tile-controls row"><div class="col-md-6 control-button news-tile-controls-votes"> <a href=""> <i class="fa fa-chevron-up" aria-hidden="true"></i> </a> <span class="vote-amounts">' + this.unloadedArticles[x].getArticleScore() + '</span> <a href=""> <i class="fa fa-chevron-down" aria-hidden="true"></i> </a> </div><div class="col-md-6 control-button news-tile-controls-pin text-right"> <a class="control-icon pushpin" href=""><i id="' + this.unloadedArticles[x].getId() + '" class="fa fa-thumb-tack "></i></a> </div> </div> <div class="news-tile-image row"> <div class="col-md-12"><div class="news-tile-img-col"><img src="' + checkImageForNull(this.unloadedArticles[x].getUrlToImage()) + '" class="img-responsive"></div> </div> </div> <div class="news-tile-info row"> <div class="col-md-12"> <a class="news-tile-info-wrap article-link" href="' + createNavSafeLink(this.unloadedArticles[x].getTitle()) + '"> <span class="news-time-date">' + this.unloadedArticles[x].getSource() + ' | ' + this.unloadedArticles[x].getPublishedAt() + ' | ' + this.unloadedArticles[x].getCategory() + ' </span> <h2>' + this.unloadedArticles[x].getTitle() + '</h2> </a> </div> </div> </div> </div>' + newsHub.innerHTML;
                } else {
                    newsHub.innerHTML = '<div id="article' + this.unloadedArticles[x].getId() + '" class="col-md-12 article"><div class="news-tile"><div class="news-tile-controls row"><div class="col-md-6 control-button news-tile-controls-votes"> <a href=""> <i class="fa fa-chevron-up" aria-hidden="true"></i> </a> <span class="vote-amounts">' + this.unloadedArticles[x].getArticleScore() + '</span> <a href=""> <i class="fa fa-chevron-down" aria-hidden="true"></i> </a> </div><div class="col-md-6 control-button news-tile-controls-pin text-right"> <a class="control-icon pushpin" href=""><i id="' + this.unloadedArticles[x].getId() + '" class="fa fa-thumb-tack "></i></a> </div> </div> <div class="news-tile-image row"> <div class="col-md-12"><div class="news-tile-img-col"><img src="' + checkImageForNull(this.unloadedArticles[x].getUrlToImage()) + '" class="img-responsive"></div> </div> </div> <div class="news-tile-info row"> <div class="col-md-12"> <a class="news-tile-info-wrap article-link" href="' + createNavSafeLink(this.unloadedArticles[x].getTitle()) + '"> <span class="news-time-date">' + this.unloadedArticles[x].getSource() + ' | ' + this.unloadedArticles[x].getPublishedAt() + ' | ' + this.unloadedArticles[x].getCategory() + ' </span> <h2>' + this.unloadedArticles[x].getTitle() + '</h2> </a> </div> </div> </div> </div>' + newsHub.innerHTML;
                }

                this.articleList.push(this.unloadedArticles[x]);

            }
        } else {
            console.log("nothing new to load");
        }

        //sort the article list now unloaded entities have been loaded.
        this.sortArticlesById();

        //empty the array so it's ready for use again.
        this.unloadedArticles = [];

        //configure news label after changes
        this.configureNewsLabel();

    };

    /**
     * Returns if our current website has scrolling.
     * @returns {boolean}
     */
    this.getScrolling = () => {
        return this.scrolling;
    };

    /**
     * Sets a new value to scrolling, used as part of the infinity scrolling feature to add and remove events.
     * @param newValue
     */
    this.setScrolling = (newValue) => {
        this.scrolling = newValue;
    };

    this.getArticleByName = (str) => {
        for (var x = 0; x < this.articleList.length; x++) {
            if (this.articleList[x].getWebSafeLink() === str) {
                return this.articleList[x];
            }
        }
        return false;
    };

    this.getArticleById = (id) => {

        for (var x = 0; x < this.articleList.length; x++) {
            if (this.articleList[x].getId() == id) {
                return this.articleList[x];
            }
        }

        console.log(this.articleList);

        return false;
    };

    this.setLastId = (newID) => {
        this.lastId = newID;
    };

    this.addPinnedArticleToList = (article) => {
        $(document).ready(() => {
            $('#pinlist-ul').prepend('<li><a href="/article/' + article.getWebSafeLink() + '">' + article.getTitle() + '</a></li>');
        });
    };

    this.appendSearchItems = (data) => {

        this.searchArticles = [];
        $('#search-div').empty();


        $('#logo').removeClass('hidden');
        $('#loader').css('display', 'none');

        var tempArr = [];

        for (var x = 0; x < data.length; x++) {
            var tempArticle = new Article();
            tempArticle.setId(data[x]._source.id);
            tempArticle.setSource(data[x]._source.source);
            tempArticle.setAuthor(data[x]._source.author);
            tempArticle.setTitle(data[x]._source.title);
            tempArticle.setDesc(data[x]._source.articledesc);
            tempArticle.setUrl(data[x]._source.url);
            tempArticle.setUrlToImage(data[x]._source.urltoimage);
            tempArticle.setPublishedAt(formatDate(data[x]._source.publishedAt));
            tempArticle.setArticleScore(data[x]._source.articlescore);
            tempArticle.setCategory(data[x]._source.category);
            tempArticle.setWebSafeLink(data[x]._source.webSafeLink);
            tempArr.push(tempArticle);
        }

        this.searchArticles = tempArr;

        const searchRes = document.getElementById("search-div");

        for (var t = 0; t < this.searchArticles.length; t++) {
            if (this.currentViewType === 'tile') {
                searchRes.innerHTML = ' <div id="article' + this.searchArticles[t].getId() + '" class="col-md-6 news-tile-half article"><div class="news-tile"><div class="news-tile-controls row"><div class="col-md-6 control-button news-tile-controls-votes"> <a href=""> <i class="fa fa-chevron-up" aria-hidden="true"></i> </a> <span class="vote-amounts">' + this.searchArticles[t].getArticleScore() + '</span> <a href=""> <i class="fa fa-chevron-down" aria-hidden="true"></i> </a> </div><div class="col-md-6 control-button news-tile-controls-pin text-right"> <a class="control-icon pushpin" href=""><i id="' + this.searchArticles[t].getId() + '" class="fa fa-thumb-tack "></i></a> </div> </div> <div class="news-tile-image row"> <div class="col-md-12"><div class="news-tile-img-col"><img src="' + checkImageForNull(this.searchArticles[t].getUrlToImage()) + '" class="img-responsive"></div> </div> </div> <div class="news-tile-info row"> <div class="col-md-12"> <a class="news-tile-info-wrap article-link" href="' + createNavSafeLink(this.searchArticles[t].getTitle()) + '"> <span class="news-time-date">' + this.searchArticles[t].getSource() + ' | ' + this.searchArticles[t].getPublishedAt() + ' | ' + this.searchArticles[t].getCategory() + ' </span> <h2>' + this.searchArticles[t].getTitle() + '</h2> </a> </div> </div> </div> </div>' + searchRes.innerHTML;
            } else {
                searchRes.innerHTML = '<div id="article' + this.searchArticles[t].getId() + '" class="col-md-12 article"><div class="news-tile"><div class="news-tile-controls row"><div class="col-md-6 control-button news-tile-controls-votes"> <a href=""> <i class="fa fa-chevron-up" aria-hidden="true"></i> </a> <span class="vote-amounts">' + this.searchArticles[t].getArticleScore() + '</span> <a href=""> <i class="fa fa-chevron-down" aria-hidden="true"></i> </a> </div><div class="col-md-6 control-button news-tile-controls-pin text-right"> <a class="control-icon pushpin" href=""><i id="' + this.searchArticles[t].getId() + '" class="fa fa-thumb-tack "></i></a> </div> </div> <div class="news-tile-image row"> <div class="col-md-12"><div class="news-tile-img-col"><img src="' + checkImageForNull(this.searchArticles[t].getUrlToImage()) + '" class="img-responsive"></div> </div> </div> <div class="news-tile-info row"> <div class="col-md-12"> <a class="news-tile-info-wrap article-link" href="' + createNavSafeLink(this.searchArticles[t].getTitle()) + '"> <span class="news-time-date">' + this.searchArticles[t].getSource() + ' | ' + this.searchArticles[t].getPublishedAt() + ' | ' + this.searchArticles[t].getCategory() + ' </span> <h2>' + this.searchArticles[t].getTitle() + '</h2> </a> </div> </div> </div> </div>' + searchRes.innerHTML;

            }
        }
    };

    this.emptySearchArticles = () => {
        this.searchArticles = [];
        $('#search-div').empty();
    }
}