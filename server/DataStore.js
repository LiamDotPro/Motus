/**
 * Created by li on 12/03/2017.
 */

var Client = require('./Client.js');
var UUID = require('./UUID.js');
var mysql = require('promise-mysql');

var dataStore = function () {

    var self = this;
    this.pool = null;
    this.clientArr = new Map();
    this.uuid = new UUID();
    this.loadedExspierences = false;

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
                self.addClient(rows[i].uuid, new Client());
            }
        }).then(function () {
            self.loadedExspierences = true;
            console.log('loaded all data from database into store.');
        });

    };

    /**
     * Ref to self which can be used in context inside the outer lexical scope.
     * @returns {dataStore}
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
    this.registerNewClient = function (ip, county, country) {

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

        this.pool.query('INSERT INTO `exp` (uuid) VALUES ("' + uniqueId + '")');

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

};

module.exports = dataStore;