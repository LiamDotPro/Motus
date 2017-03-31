/**
 * Created by li on 12/03/2017.
 */

var Client = require('./Client.js');
var User = require('./User.js');
var UUID = require('./UUID.js');

var ArticleBank = require('./ArticleBank.js');
var mysql = require('promise-mysql');
var Promise = require("bluebird");

var passwordHash = require('password-hash');

var DataStore = function () {

    var self = this;
    this.pool = null;
    this.users = new Map();
    this.clientArr = new Map();
    this.uuid = new UUID();
    this.articleBank = new ArticleBank();
    this.loadedExspierences = false;


    this.getAllArticles = function () {
        return this.articleBank.getAllArticles();
    };

    /**
     * sets the connection pool.
     * @param pool
     */
    this.setPool = function (pool) {
        this.pool = pool;
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
        this.articleBank.loadArticlesFromDatabase();
        this.articleBank.StartCollectingArticles();
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
        //console.log(this.getClientList());
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

        ///client list call.
        //console.log(this.getClientList());

        return uniqueId;
    };

    /**
     * Updates a clients record within the database providing the user is registered within the datastore.
     * @param id uuid of user
     * @param data [ip, county, country]
     */
    this.updateClientAreaSettings = function (id, data) {
        if (this.clientArr.has(id)) {
            this.pool.query('UPDATE `exp` SET county="' + data[1] + '" , country="' + data[2] + '" , ip="' + data[0] + '" WHERE uuid="' + id + '"').then(function () {
                console.log('area settings updated in the database for: ' + id);
            });

            var client = this.clientArr.get(id);
            client.setDefaultClientData([data[0], data[1], data[2]]);
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
                tempUser.setAdmin(rows[i].admin);
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


        poolRef.query('INSERT INTO `users` (email, password, admin, canvasHash) VALUES (?,?,?,?)', [email.toLowerCase(), hashedPassword, jsonAdmin, jsonCanvas]);

        var tempUser = new User();

        tempUser.setEmail(email);
        tempUser.setCanvasData(jsonCanvas);
        tempUser.setAdmin(jsonAdmin);

        this.addUser(email, tempUser);

        console.log("New User created");
        return "User Created";
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
                        user.setStatus("online");
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
                    console.log(user);
                    console.log(accessObj);
                    console.log(email);
                    socket.emit('successfulLogin', {
                        access: accessObj.Access
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
    }

};

module.exports = DataStore;