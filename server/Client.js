/**
 * Created by li on 04/03/2017.
 */

var Client = function (id) {

    this.id = id;
    this.status = 'online';

    this.getId = function () {
        return this.id;
    };

    this.changeStatus = function () {
        return this.status === 'offline' ? 'online' : 'offline';
    }

};

module.exports = Client;