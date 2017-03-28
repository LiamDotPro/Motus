/**
 * Created by li on 28/03/2017.
 */

function Client(socket) {

    this.id = null;
    this.referrer = document.referrer;
    this.reso = [window.screen.availHeight, window.screen.availWidth];

    this.setId = function (id) {
        this.id = id;
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

            //getting cookie from previous session.
            var id = decipherCookie('id');
            this.setId(id);

            //emit the ID found in the cookie and also the path we received.
            socket.emit('assignOldUser', {
                id: this.id
            });
        }
    };

    /**
     * When registering a new user we take there initial settings and using the ip info api also make note of
     * there outlined geo ip.
     */
    function updateAreaSettings(id) {

        $.get("http://ipinfo.io", function (response) {
            /**
             * Using socket here so we send the information back for logging when it return from the request.
             */
            socket.emit('updateUserAreaSettings', {
                ip: response.ip,
                county: response.city,
                country: response.region,
                id: id
            });

        }, "jsonp");
    }

    /**
     * Adds a new cookie for the user to track them across the website
     */
    this.addCookie = function (id) {
        document.cookie = 'id=' + id + ';' + ' createdAt=' + window.location.pathname + ';';
        this.id = id;
        console.log("new cookie generated for user's session");

        // attempt to grab area data about our new user.
        updateAreaSettings(id);

        //Attempt to collect canvas data
        this.collectCanvasData();
    };

    /**
     * Deciphers a cookie string into a use able javascript array.
     * @param ref the cookies ref we are looking to extract.
     */
    function decipherCookie(ref) {
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
        }
    }

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
    }

}