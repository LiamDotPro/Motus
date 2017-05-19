/**
 * Created by li on 28/03/2017.
 */

function Client(socket) {

    var self = this;
    this.id = null;
    this.clientSessionCreatedAt = null;
    this.referrer = document.referrer;
    this.reso = [window.screen.availHeight, window.screen.availWidth];
    this.user = null;

    this.setUser = (userObj) => {
        console.log(userObj);
        this.user = new User();
        this.user.setId(userObj.id);
        this.user.setEmail(userObj.email);

        if (userObj === "true") {
            this.user.setAdmin(true);
        } else {
            this.user.setAdmin(false);
        }

        this.user.setArticleObjects(userObj.pinnedArticles);
        this.user.setViewedArticles(userObj.viewedArticles);

    };

    this.getUser = () => {
        return this.user;
    };

    this.setId = function (id) {
        this.id = id;
    };

    this.setClientCreatedAt = function (createdAt) {
        this.clientSessionCreatedAt = createdAt;
    };

    this.addPinnedArticleToUser = (articleToAdd) => {
        this.user.pinnedArticles.push(articleToAdd);

        console.log(this.user);

        socket.emit('addNewPinnedArticle', {
            email: this.user.email,
            article: articleToAdd
        });
    };

    this.getPinnedArticlesArr = () => {
        return this.user.pinnedArticles;
    };

    this.checkPinnedStatus = (articleId) => {

        console.log(this.user.pinnedArticles);

        let output = this.user.pinnedArticles.filter((e) => {
            return e.getId() == articleId;
        });

        return output <= 0;

    };

    /**
     * Returns a referral address if one exists otherwise nothing is passed.
     */
    this.getReferringDocument = function () {
        if (!this.referrer) {
            return 'none';
        } else {
            return this.referrer;
        }
    };

    /**
     * This is called when finding the starting resolution.
     * @returns {[*,*]}
     */
    this.getRes = function () {
        this.reso = [window.screen.availHeight, window.screen.availWidth];
    };

    /**
     * Checks if a Cookie has been presented before collecting information.
     */
    this.checkForCookie = function () {
        if (!document.cookie) {
            socket.emit('registerUser', {
                ref: this.referrer,
                reso: this.reso
            });
        } else {
            console.log("Cookie from previous session found");

            if (this.decipherCookie('user') !== false) {
                //reassign logged in user
                console.log("logged in user found");
                console.log(this.decipherCookie('user'));

                $(document).ready(() => {
                    $('#login-btn').addClass('hidden');
                    $('#login-panel').addClass('hidden');
                    $('#register-user').addClass('hidden');
                    $('#user-dashboard').removeClass('hidden');
                    $('#logout-btn').removeClass('hidden');
                });


                //request user obj
                socket.emit('getUserObject', {
                    user: this.decipherCookie('user')
                });

                //assign normal settings for client instance.
                //getting cookie from previous session.
                var id = self.decipherCookie('id');
                var createdAt = self.decipherCookie('createdAt');
                this.setId(id);
                this.setClientCreatedAt(createdAt);

                //emit the ID found in the cookie and also the path we received.
                socket.emit('assignOldUser', {
                    id: this.id
                });
            } else {

                //getting cookie from previous session.
                var id = self.decipherCookie('id');
                var createdAt = self.decipherCookie('createdAt');
                this.setId(id);
                this.setClientCreatedAt(createdAt);

                //emit the ID found in the cookie and also the path we received.
                socket.emit('assignOldUser', {
                    id: this.id
                });
            }
        }
    };

    /**
     * When registering a new user we take there initial settings and using the ip info api also make note of
     * there outlined geo ip.
     */
    function updateAreaSettings(id, createdAt) {

        $.get("http://ipinfo.io", function (response) {
            /**
             * Using socket here so we send the information back for logging when it return from the request.
             */
            socket.emit('updateUserAreaSettings', {
                ip: response.ip,
                county: response.city,
                country: response.region,
                id: id,
                createdLocation: createdAt
            });

        }, "jsonp");
    }

    /**
     * Adds a new cookie for the user to track them across the website
     */
    this.addCookie = function (id) {
        document.cookie = 'id=' + id + ';';
        document.cookie = 'createdAt=' + window.location.pathname + ';';
        this.id = id;
        console.log("new cookie generated for user's session");

        console.log(document.cookie);

        // attempt to grab area data about our new user.
        updateAreaSettings(id, window.location.pathname);

        //Attempt to collect canvas data
        this.collectCanvasData();
    };

    /**
     * Deciphers a cookie string into a use able javascript array.
     * @param ref the cookies ref we are looking to extract.
     */
    this.decipherCookie = function (ref) {
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArr = decodedCookie.split(';');
        const resultCookieArr = chunkArrOfPieces(cookieArr);

        switch (ref) {
            case 'id':
                return resultCookieArr[0][1];
                break;
            case 'createdAt':
                return resultCookieArr[1][1];
                break;
            case 'user':
                if (cookieArr.length > 2) {
                    return resultCookieArr[2][1];
                } else {
                    return false;
                }
                break;
        }
    };

    /**
     * Helper function that takes an array splits the values by = and then returns a multi dimensional array with
     * key => value style arrays inside.
     * @param cookieArr
     * @returns {Array}
     */
    function chunkArrOfPieces(cookieArr) {
        var result = [];
        for (var x = 0; x < cookieArr.length; x++) {
            var pieces = cookieArr[x].split('=');
            result.push(pieces);
        }
        return result;

    }

    /**
     * Deletes the current cookie by setting it's expires field to yesterday.
     */
    this.deleteCookie = function (name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    /**
     * Collects canvas data using FingerPrint2 - https://github.com/Valve/fingerprintjs2
     */
    this.collectCanvasData = function () {

        //Canvas Hashing for user plus other data.
        new Fingerprint2().get(function (result, components) {

            socket.emit('clientCanvasData', {
                hash: result,
                arrOfData: components
            });

            console.log(result); //a hash, representing your device fingerprint
            console.log(components); // an array of FP components
        });
    };

    this.getLocaleLang = function () {
        var language = navigator.languages && navigator.languages[0] ||
            navigator.language ||
            navigator.userLanguage;
    };

    /**
     * When a user is logged in there user details are appended to the cookie.
     * @param email
     */
    this.addUserDetailsToCookie = function (email) {
        document.cookie = " user=" + email + ";";
    };

    this.appendPinnedArticles = () => {
        var articleArr = this.user.pinnedArticles;
        for (var x = articleArr.length; x > 0; x--) {
            $('#pinlist-ul').append('<li><a href="/article/' + articleArr[x - 1].websafelink + '">' + articleArr[x - 1].title + '</a></li>');
        }
    }

}