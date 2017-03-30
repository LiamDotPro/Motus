/**
 * Created by li on 30/03/2017.
 */

var User = function () {

    this.id = 0;
    this.email = '';
    this.admin = {};
    this.canvasData = {};

    this.getId = () => {
        return this.id;
    };

    this.getEmail = () => {
        return this.email;
    };

    this.getAdmin = () => {
        return this.admin;
    };

    this.getCanvasData = () => {
        return this.canvasData;
    };

    this.setId = (newId) => {
        this.id = newId;
    };

    this.setEmail = (newEmail) => {

    };

    this.setAdmin = (newAdminObj) => {
        this.admin = newAdminObj;
    };

    this.setCanvasData = (newCanvasDataObj) => {
        this.canvasData = newCanvasDataObj;
    }
};

module.exports = User;