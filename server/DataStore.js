/**
 * Created by li on 12/03/2017.
 */

var Client = require('./Client.js');
var UUID = require('./UUID.js');

var dataStore = function () {

    var self = this;
    this.pool = null;
    this.clientArr = new Map();
    this.uuid = new UUID();

    /**
     * sets the connection pool.
     * @param conn
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
        });

    };

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
     * @returns {Map}
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
        console.log(this.getClientList());
    };

    /**
     * Registers a new instance of client within the datastore and also adds a new instance to the database.
     */
    this.registerNewClient = function () {

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

        console.log(this.getClientList());

        return uniqueId;
    };

};

module.exports = dataStore;