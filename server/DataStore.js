/**
 * Created by li on 12/03/2017.
 */

var dataStore = function (connection) {

    var self = this;
    this.con = connection;
    this.clientArr = new Map();

    /**
     * Loads all of the user experiences into the array.
     */
    this.loadExp = function () {
        loadData(this.con, function (err, result) {
            self.addClient(result.uuid, 'test');
        });

    };

    function loadData(con, callback) {
        con.query('SELECT * FROM exp', function (err, rows, fields) {
            if (err) throw err;
            for (var i in rows) {
                callback(null, rows[i]);
            }
        });
    }

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
     * Creates a new instance of a client within the database and also within our datastore.
     * @param id
     * @param client
     */
    this.addClient = function (id, client) {
        this.clientArr.set(id, client);
        console.log(this.getClientList());
    };

};

module.exports = dataStore;