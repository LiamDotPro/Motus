/**
 * Created by li on 12/03/2017.
 */

var Client = require('./Client.js');
var User = require('./User.js');
var Source = require('./Source.js');
var UUID = require('./UUID.js');
var WordsFilter = require('./Words.js');
var SourceAnalytics = require('./SourceAnalytics.js');
var CategoryFilter = require('./CategoryFilter.js');
var ArticleBank = require('./ArticleBank.js');

var mysql = require('promise-mysql');
var Promise = require("bluebird");
var moment = require("moment");

var passwordHash = require('password-hash');

var DataStore = function () {

    var self = this;
    this.pool = null;
    this.users = new Map();
    this.clientArr = new Map();
    this.sourceArr = new Map();
    this.uuid = new UUID();
    this.articleBank = new ArticleBank();
    this.wordsFilter = new WordsFilter();
    this.sourceFilter = new SourceAnalytics();
    this.categoryFilter = new CategoryFilter();
    this.sourcesLoaded = false;


    /**
     * sets the connection pool.
     * @param pool
     */
    this.setPool = function (pool) {
        this.pool = pool;
    };

    /**
     * Loads all of the sources
     */
    this.loadSources = () => {
        this.pool.query('SELECT * FROM `sources`').then(function (rows) {
            for (var i in rows) {
                var clientObj = new Source();
                clientObj.setId(rows[i].id);
                clientObj.setCat(rows[i].category);
                clientObj.setName(rows[i].name);
                clientObj.setKey(rows[i].key);
                clientObj.setState(rows[i].avalible);
                self.addSource(rows[i].id, clientObj);
            }
        }).then(function () {
            console.log("loaded all sources from database into store");
            self.sourcesLoaded = true;
        });
    };

    /**
     * Adds a new instance of source to the sourceArr Map.
     * @param id
     * @param sourceObj
     */
    this.addSource = (id, sourceObj) => {
        this.sourceArr.set(id, sourceObj);
    };

    /**
     * Loads all of the user experiences into the array.
     */
    this.loadExp = function () {
        this.pool.query('SELECT * FROM `exp`').then(function (rows) {
            for (var i in rows) {
                var clientObj = new Client();
                clientObj.setId(rows[i].uuid);
                clientObj.setIp(rows[i].ip);
                clientObj.setCountry(rows[i].country);
                clientObj.setCounty(rows[i].county);
                self.addClient(rows[i].uuid, clientObj);
            }
        }).then(function () {
            self.loadedExspierences = true;
            console.log('loaded all user data from database into store.');
        });

    };

    this.getArticles = function (pool) {
        this.articleBank.setPool(pool);
        this.articleBank.StartCollectingArticles(this.sourceArr);
    };

    /**
     * Ref to self which can be used in context inside the outer lexical scope.
     * @returns {DataStore}
     */
    this.getSelf = function () {
        return self;
    };

    /**
     * Returns the value of a client from within the hash map.
     * @param id
     * @returns {*|String}
     */
    this.getClient = function (id) {
        var value = this.clientArr.get(id);
        if (value != null) {
            return value;
        } else {
            return 'err';
        }
    };

    /**
     * Returns a full list of clients.
     * @returns {Client}
     */
    this.getClientList = function () {
        return this.clientArr;
    };

    /**
     * Creates a new instance of a client within the database.
     * @param id
     * @param client
     */
    this.addClient = function (id, client) {
        this.clientArr.set(id, client);
    };

    /**
     * Registers a new instance of client within the datastore and also adds a new instance to the database.
     */
    this.registerNewClient = function (res, ref) {

        //generate new unique ID and then grab it for use when identifying this user in future sessions.
        this.uuid.generateUUID();
        var uniqueId = this.uuid.getUUID();

        //Using methods to setup the client instance
        var clientInstance = new Client();

        //increase initial tabs open to one.
        clientInstance.increaseTabs();

        //set initial status to online
        clientInstance.changeStatus('online');

        //add the newly created client to the datastore.
        this.clientArr.set(uniqueId, clientInstance);

        var resStr = res[1] + "x" + res[0];

        this.pool.query('INSERT INTO `exp` (uuid, ref, screenRes) VALUES ("' + uniqueId + '", "' + ref + '", "' + resStr + '")');

        return uniqueId;
    };

    /**
     * Updates a clients record within the database providing the user is registered within the datastore.
     * @param id uuid of user
     * @param data [ip, county, country]
     */
    this.updateClientAreaSettings = function (id, data) {
        if (this.clientArr.has(id)) {
            this.pool.query('UPDATE `exp` SET county="' + data[1] + '" , country="' + data[2] + '" , ip="' + data[0] + '", startingLoc="' + data[3] + '"  WHERE uuid="' + id + '"').then(function () {
                console.log('area settings updated in the database for: ' + id);
            });

            var client = this.clientArr.get(id);
            client.setDefaultClientData([data[0], data[1], data[2], data[3]]);
            console.log('area settings updated within the datastore for: ' + id);

        } else {
            console.log("tried to update a record that doesn't exist");
        }
    };

    this.createCanvasFingerPrintRecord = function (data, client) {

        //uncomment below for detailed logging.

        // console.log(data.hash);
        //
        // for (var x in data.arrOfData) {
        //
        //     if (data.arrOfData[x].key === 'canvas' || data.arrOfData[x].key === 'webgl') {
        //         console.log('componenet ' + x);
        //     } else {
        //         console.log('componenet ' + x);
        //         console.log(data.arrOfData[x].key);
        //         console.log(data.arrOfData[x].value);
        //     }
        //
        // }

        function makeRes(arr) {
            return arr[0] + 'x' + arr[1];
        }

        function touchSupport(arr) {
            return arr[0] + '-' + arr[1] + '-' + arr[2];
        }

        function jsFonts(arr) {
            var str = '';

            for (x in arr) {
                str += arr[x] + "-";
            }

            return str;

        }

        // 22 fields hw ss dnt_tr js fonts
        // 24 values
        var sql = 'INSERT INTO `canvasdata` (hash, user_agent, lang, color_depth, pixel_ratio, hardware_concurrency, resolution, available_resolution, timezone_offset, session_storage, local_storage, indexed_db, ' +
            'cpu_class, navigator_platform, do_not_track, has_lied_lang, has_lied_resolution, has_lied_os, touch_support, js_fonts, adblock, has_lied_browser)' +
            ' VALUES ("' + data.hash + '","' + data.arrOfData[0].value + '","' + data.arrOfData[1].value + '","' + data.arrOfData[2].value + '","' + data.arrOfData[3].value + '","' + data.arrOfData[4].value + '","' + makeRes(data.arrOfData[5].value) + '","' + makeRes(data.arrOfData[6].value) + '","' + data.arrOfData[7].value + '","' + data.arrOfData[8].value + '","' + data.arrOfData[9].value + '","' + data.arrOfData[10].value + '","' + data.arrOfData[11].value + '","' + data.arrOfData[12].value + '","' + data.arrOfData[13].value + '","' + data.arrOfData[18].value + '","' + data.arrOfData[19].value + '","' + data.arrOfData[20].value + '","' + touchSupport(data.arrOfData[22].value) + '","' + jsFonts(data.arrOfData[23].value) + '","' + data.arrOfData[17].value + '","' + data.arrOfData[21].value + '")';


        var poolRef = this.pool;

        poolRef.query(sql).then(function (result) {
            return poolRef.query('UPDATE `exp` SET canvasId="' + result.insertId + '" WHERE UUID="' + client + '"');
        }).then(function () {
            console.log('Updated experience table with canvas record for:' + client);
        });

    };

    this.getArticleBank = function () {
        return this.articleBank;
    };

    this.addUser = function (key, value) {
        this.users.set(key, value);
    };

    /**
     * Loads all of the users from the database into the server map.
     */
    this.loadUsers = function () {
        this.pool.query('SELECT * FROM `users`').then(function (rows) {
            for (var i in rows) {
                var tempUser = new User();
                tempUser.setId(rows[i].id);
                tempUser.setEmail(rows[i].email);
                tempUser.setCanvasData(rows[i].canvasData);
                var admin = JSON.parse(rows[i].admin);
                tempUser.setAdmin(admin.Access);
                tempUser.setPinnedArticles(rows[i].pinnedArticles);
                tempUser.setCategoryProfileData(rows[i].categoryProfile);
                tempUser.setViewedArticleIds(rows[i].viewedArticles);
                tempUser.setKeywordProfile(rows[i].keywordProfile);
                self.addUser(rows[i].email, tempUser);
            }
        }).then(function () {
            console.log('loaded all users from database into store.');
        }).catch(function (e) {
            console.log(e);
        });
    };


    /**
     * Attempts to register a new account for a user.
     * @param canvasHash
     * @param email
     * @param password
     * @param admin
     */
    this.registerNewUser = function (canvasHash, admin, email, password) {

        //Checking to see if the user is already registered.
        if (this.users.has(email.toLowerCase())) {
            return "Email Already Registered";
        }

        var adminObj = {};

        if (admin === true) {
            adminObj = {
                Access: true
            }
        } else {
            adminObj = {
                Access: false
            }
        }

        var canvasObj = {
            hashes: [canvasHash]
        };

        var jsonAdmin = JSON.stringify(adminObj);
        var jsonCanvas = JSON.stringify(canvasObj);

        var hashedPassword = passwordHash.generate(password);
        var poolRef = this.pool;

        let emptyArr = [];
        let emptyCatObj = {
            "general": 0,
            "sport": 0,
            "technology": 0,
            "business": 0,
            "entertainment": 0,
            "science_and_nature": 0,
            "gaming": 0,
            "music": 0
        };

        var pinnedArticles = JSON.stringify(emptyArr);
        var viewedArticles = JSON.stringify(emptyArr);
        var categoryProfile = JSON.stringify(emptyCatObj);
        var keywordProfile = JSON.stringify({});

        return poolRef.query('INSERT INTO `users` (email, password, admin, canvasHash, pinnedArticles, categoryProfile, viewedArticles, keywordProfile) VALUES (?,?,?,?,?,?,?,?)', [email.toLowerCase(), hashedPassword, jsonAdmin, jsonCanvas, pinnedArticles, categoryProfile, viewedArticles, keywordProfile]).then((res) => {
            let tempUser = new User();

            tempUser.setEmail(email);
            tempUser.setCanvasData(jsonCanvas);
            tempUser.setAdmin(jsonAdmin);
            tempUser.setId(res.insertId);
            tempUser.setCategoryProfileData(emptyCatObj);

            self.addUser(email, tempUser);

            console.log("New User created");
            return "User Created";
        });


    };

    /**
     * Verifies a users login credentials.
     * @param email
     * @param password
     * @param socket
     * @returns {boolean}
     */
    this.verifyUser = function (email, password, socket) {
        if (this.users.has(email.toLowerCase())) {
            let loginPromise = new Promise((resolve, reject) => {
                var poolRef = this.pool;
                poolRef.query('Select * FROM `users` WHERE email="' + email + '"').then((row) => {
                    if (passwordHash.verify(password, row[0].password)) {
                        let user = self.getUserByEmail(email);
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });

            loginPromise.then((outcome) => {
                if (outcome) {
                    let user = self.getUserByEmail(email);
                    let accessObj = JSON.parse(user.getAdmin());

                    socket.emit('successfulLogin', {
                        email: email,
                        access: accessObj.Access,
                        user: user
                    });
                } else {
                    socket.emit('incorrectLogin', {});
                }
            })
        } else {
            return false;
        }

    };

    this.getUserByEmail = (email) => {
        return this.users.get(email);
    };

    /**
     * pushes a new pinned article object onto a user.
     * @param email
     * @param article
     * @returns {boolean}
     */
    this.pushPinnedArticles = (email, article) => {
        let user = this.getUserByEmail(email);
        let poolRef = this.pool;

        //Check to see if the article already exists within the list.
        for (let x = 0; x < user.getPinnedArticles().length; x++) {
            if (user.getPinnedArticles()[x].id === article.id) {
                return false;
            }
        }

        //Push new articles to the live model and also update database model
        user.addPinnedArticle(article);

        return poolRef.query('UPDATE `users` SET pinnedArticles=? WHERE email=? ;', [user.getPinnedArticlesAsJson(), email]);
    };

    /**
     * gets the total User Count
     * @returns {number}
     */
    this.getUserCount = () => {
        return this.users.size;
    };

    /**
     * gets the total client count
     * @returns {number}
     */
    this.getClientCount = () => {
        return this.clientArr.size;
    };

    /**
     * Inserts a record for the amount of articles collected and live at this point.
     * @param day
     * @param month
     * @param year
     */
    this.logArticleStats = (day, month, year) => {
        let poolRef = this.pool;
        poolRef.query('INSERT INTO `articlecounter` (day,month,year,count) VALUES (?,?,?,?)', [day, month, year, this.getArticleBank().getArticlesSize()]);
    };

    this.getGraphData = (day, month, year, socket) => {
        let poolRef = this.pool;
        let result = [];

        poolRef.query('SELECT * FROM `articlecounter` ORDER BY id DESC').then((rows) => {
            var arr = [];

            for (let x = 0; x < 7; x++) {
                arr.push([rows[x].day, rows[x].month, rows[x].year, rows[x].count]);
            }

            return arr;

        }).then((arr) => {
            socket.emit('recGraphData', {
                arr: arr,
                currentCount: self.getArticleBank().getArticlesSize()
            });
        });
    };

    this.getPieData = () => {
        return this.categoryFilter.getDataObj();
    };

    this.processCatData = () => {
        this.getArticleBank().getAllArticles().then((res) => {
            this.categoryFilter.processArticles(res);
            console.log("Collected Category Stats");
        });
    };

    /**
     * Updates the word filtering stat count - node scheduled for daily updates.
     */
    this.getWordStats = () => {

        this.getArticleBank().getAllArticles().then((arr) => {
            for (let i of arr) {
                this.wordsFilter.checkString(i.title);
            }
        }).then(() => {
            this.wordsFilter.getArrOfTopWords();
            console.log("Collected Word Stats");
        });
    };

    this.getTop10Words = () => {
        return this.wordsFilter.getTop10();
    };

    this.getTop100Words = () => {
        return this.wordsFilter.getTop100();
    };

    this.getArticlesReadyForTables = (range) => {
        let resultStr = "";


        return this.getArticleBank().getAllArticles().then((res) => {
            let c = 0;
            for (x of res) {
                if (c <= range) {
                    resultStr += "<tr><td><a href='/article/" + x.websafelink + " target='_blank'><i class='fa fa-eye'></i></a></td><td>" + x.source + "</td><td>" + x.title + "</td><td>" + moment(x.publishedAt).format("DD MM YYYY - h:mm a") + "</td><td>" + x.articleScore + "</td></tr>";
                    c++;
                } else {
                    break;
                }
            }

            return resultStr;
        });

    };

    this.getSourcesData = () => {

        /**
         * Adds all source names to source object for processing.
         */
        for (let y of this.sourceArr.values()) {
            this.sourceFilter.addSourceProp(y.getName())
        }

        this.getArticleBank().getAllArticles().then((res) => {
            let ArrOfCalls = [];

            for (let x of res) {
                ArrOfCalls.push(this.sourceFilter.processSourceData(x.getSource()));
            }

            return Promise.all(ArrOfCalls).then(() => {
                console.log("Collected Sources Stats");
            }).catch(e => {
                console.log(e);
            });

        });


    };

    /**
     * Gets the source information from the source filter.
     * @returns {{}|*}
     */
    this.getSourceStats = () => {
        return this.sourceFilter.getSourceData();
    };


    /**
     * Gets the current state of the loaded sources.
     * @returns {boolean}
     */
    this.getLoadedSourceBool = () => {
        return this.sourcesLoaded;
    };

    this.getUsersReadyForTables = () => {
        let resultStr = "";
        for (x of this.users.values()) {
            resultStr += "<tr><td>" + x.id + "</td><td>" + x.email + "</td><td>" + x.admin + "</td></tr>";
        }

        return resultStr;

    };

    /**
     * Gets the information about sources for data toggles.
     */
    this.getSourcesToggleInfo = () => {

        let arrOfSources = [];

        for (let x of this.sourceArr.values()) {
            arrOfSources.push([x.id, x.name, x.state]);
        }

        return arrOfSources;

    };

    this.getSingleArticle = (link, socket) => {
        this.articleBank.queryArticleByLink(link, socket);
    };

    this.requestNext100 = (id, socket) => {
        this.articleBank.queryForMoreArticles(id, socket);
    };

    this.updateCategoryProfile = (user, categoryProfile) => {
        let poolRef = this.pool;

        poolRef.query('UPDATE `users` SET categoryProfile=? Where id="' + user.id + '"; ', [JSON.stringify(categoryProfile)]).then(() => {
        });

        let srvUser = this.getUserByEmail(user.email);

        srvUser.setCategoryProfileData(JSON.stringify(categoryProfile));
    };

    this.updateViewedArticles = (user) => {
        let poolRef = this.pool;

        poolRef.query('UPDATE `users` SET viewedArticles=? Where id="' + user.id + '"; ', [JSON.stringify(user.viewedArticles)]).then(() => {
        });
    };

    this.updateKeywordAnalysisProfile = (user, profile) => {
        let poolRef = this.pool;

        poolRef.query('UPDATE `users` SET keywordProfile=? Where id="' + user.id + '"; ', [JSON.stringify(profile)]).then(() => {
        });
    }

};

module.exports = DataStore;