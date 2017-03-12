/**
 * Created by li on 04/03/2017.
 */

var Client = function (socketId) {

    this.socketId = id;
    this.status = 'online';

    this.getSocketId = function () {
        return this.socketId;
    };

    this.changeStatus = function () {
        return this.status === 'offline' ? 'online' : 'offline';
    }

};

module.exports = Client;