/**
 * Created by li on 22/04/2017.
 */

var CategoryFilter = function () {

    this.dataObj = {
        general: 0,
        sport: 0,
        technology: 0,
        business: 0,
        entertainment: 0,
        science_and_nature: 0,
        gaming: 0,
        music: 0,
    };


    this.processArticles = (articleMap) => {
        for (let i of articleMap.values()) {
            switch (i.category) {
                case "general":
                    this.dataObj.general++;
                    break;
                case "sport":
                    this.dataObj.sport++;
                    break;
                case "technology":
                    this.dataObj.technology++;
                    break;
                case "business":
                    this.dataObj.business++;
                    break;
                case "entertainment":
                    this.dataObj.entertainment++;
                    break;
                case "science_and_nature":
                    this.dataObj.science_and_nature++;
                    break;
                case"music":
                    this.dataObj.music++;
                    break;
                case "gaming":
                    this.dataObj.gaming++;
                    break;
            }
        }
    };

    this.getDataObj = () => {
        return this.dataObj;
    }

};

module.exports = CategoryFilter;