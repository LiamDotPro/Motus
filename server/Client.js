/**
 * Created by li on 04/03/2017.
 */

var Client = function () {

    this.status = 'offline';
    this.ip = '';
    this.country = '';
    this.county = '';
    this.tabs = 0;

    /**
     * Gets the county of the client.
     * @returns {string}
     */
    this.getCounty = function () {
        return this.county;
    };

    /**
     * Gets the country of the client.
     * @returns {string}
     */
    this.getCountry = function () {
        return this.country;
    };

    /**
     * Sets a new county to the client.
     * @param newCounty
     */
    this.setCounty = function (newCounty) {

    };

    /**
     * Sets a new country to the client.
     * @param newCountry
     */
    this.setCountry = function (newCountry) {

    };

    /**
     * Changes the current status of the client dependant using a ternary for off and on - line.
     */
    this.changeStatus = function (newStatus) {
        this.status = newStatus;
    };

    /**
     * Gets the current status of the client.
     * @returns {string}
     */
    this.getStatus = function () {
        return this.status;
    }

    /**
     * Increase the amount of tabs a user has open.
     */
    this.increaseTabs = function () {
        this.tabs++;
    };

    /**
     * Decreases the amount of tabs a user has open.
     */
    this.decreaseTabs = function () {
        this.tabs--;
    };

    /**
     * Gets the current amount of tabs present for a user.
     * @returns {number}
     */
    this.getTabs = function () {
        return this.tabs;
    }

};

module.exports = Client;