/**
 * Created by li on 22/04/2017.
 */

var Source = function () {

    this.id = null;
    this.name = "";
    this.category = "";
    this.key = "";
    this.state = 0;

    this.setId = (newId) => {
        this.id = newId;
    };

    this.setName = (newName) => {
        this.name = newName;
    };

    this.setCat = (newCategory) => {
        this.category = newCategory;
    };

    this.setKey = (newKey) => {
        this.key = newKey;
    };

    this.setState = (newState) => {

    };

    this.getId = () => {
        return this.id;
    };

    this.getName = () => {
        return this.name;
    };

    this.getCat = () => {
        return this.category;
    };

    this.getKey = () => {
        return this.key;
    };

    this.getState = () => {
      return this.state;
    };

};

module.exports = Source;