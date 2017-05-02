/**
 * Created by li on 01/05/2017.
 */

function LearningAlgorithm(socket) {

    this.globalDecayInterval = null;

    this.interactionValues = {
        viewingArticle: 0.5,
        PinningAnArticle: 0.5,
        votingUp: 0.2,
        votingDown: -0.2,
        commenting: 0.1,
        CopyToClipBoard: 0.1
    };

    this.categoryProfile = {
        general: 0,
        sport: 0,
        technology: 0,
        business: 0,
        entertainment: 0,
        science_and_nature: 0,
        gaming: 0,
        music: 0
    };

    /**
     * This is passed from the server on load.
     * @type {{}}
     */
    this.categoryValues = {};

    /**
     * Sets the calculated Category Values.
     * @param newValuesObj
     */
    this.setCategoryValues = (newValuesObj) => {
        function sum(obj) {
            let sum = 0;
            for (let el in obj) {
                if (obj.hasOwnProperty(el)) {
                    sum += parseFloat(obj[el]);
                }
            }
            return sum;
        }

        let total = sum(newValuesObj);

        let keys = Object.keys(newValuesObj);

        let tempObj = {};

        for (let x = 0; x < keys.length; x++) {
            tempObj[keys[x]] = (total / newValuesObj[keys[x]]).toFixed(2);
        }

        //Category values have been set we can start applying a general decay.
        this.categoryValues = tempObj;
        this.setGeneralDecay();

    };

    /**
     * Adds a profile from a saved user.
     * @param newCategoryProfile
     */
    this.setCategoryProfile = (newCategoryProfile) => {
        this.categoryProfile = newCategoryProfile;
    };

    /**
     * Increases the category value.
     * @param action
     * @param category
     */
    this.increaseCategoryProfileValue = (action, category) => {

        console.log("interaction found --->");
        console.log(action);
        console.log(category);

        let actionValue = this.interactionValues[action];
        let categoryValue = this.categoryValues[category];

        //If statement limit's the total available for each category.
        if (this.categoryProfile[category] + actionValue * categoryValue < 100) {
            this.categoryProfile[category] += actionValue * categoryValue;
        } else {
            this.categoryProfile[category] = 100
        }

        //micro decay each other category based on current values.
        let keys = Object.keys(this.categoryProfile);

        for (let x = 0; x < keys.length; x++) {
            if (keys[x] !== category) {
                if (this.categoryProfile[keys[x]] > 90) {
                    this.categoryProfile[keys[x]] -= 20;
                } else if (this.categoryProfile[keys[x]] > 80) {
                    this.categoryProfile[keys[x]] -= 15;
                } else if (this.categoryProfile[keys[x]] > 70) {
                    this.categoryProfile[keys[x]] -= 10;
                } else if (this.categoryProfile[keys[x]] > 60) {
                    this.categoryProfile[keys[x]] -= 8;
                } else if (this.categoryProfile[keys[x]] > 50) {
                    this.categoryProfile[keys[x]] -= 6;
                } else if (this.categoryProfile[keys[x]] > 40) {
                    this.categoryProfile[keys[x]] -= 5;
                } else if (this.categoryProfile[keys[x]] > 30) {
                    this.categoryProfile[keys[x]] -= 4;
                } else if (this.categoryProfile[keys[x]] > 20) {
                    this.categoryProfile[keys[x]] -= 2;
                } else if (this.categoryProfile[keys[x]] > 10) {
                    this.categoryProfile[keys[x]] -= 0.5;
                } else if (this.categoryProfile[keys[x]] > 0) {
                    console.log("Not decaying an article near the bottom")
                }
            }
        }

        //update experience with profile.
        socket.emit('sendProfileChanges', {});

    };

    /**
     * Interval based decay that will slowly bring down values based on how big they already are.
     */
    this.setGeneralDecay = () => {
        //The global decay is a small global decrease that will have a lot of affect over the longer term.
        this.globalDecayInterval = setInterval(() => {
            let keys = Object.keys(this.categoryProfile);
            for (let x = 0; x < keys.length; x++) {
                if (this.categoryProfile[keys[x]] > 0) {
                    if (this.categoryProfile[keys[x]] - 2 > 0) {
                        this.categoryProfile[keys[x]] -= 2;
                    } else {
                        this.categoryProfile[keys[x]] = 0;
                    }
                }
            }
        }, 120000);
    };



    this.getProfile = () => {
        return this.categoryProfile;
    };

    this.clearGlobalDecay = () => {
        clearInterval(this.globalDecayInterval);
    };

    this.orderDataBasedOnValues = (articlesArr) => {

        //we make a new copy so that changes occurring don't conflict.
        let categoryCopy = this.categoryProfile;

        let keys = Object.keys(categoryCopy);


        //This makes records records kind of random but categories regularly viewed will change.
        for (let x = 0; x < keys.length; x++) {
            if (categoryCopy[keys[x]] < 1) {
                categoryCopy[keys[x]] = ((Math.random() * 2) + 1).toFixed(2);
            }
        }

        let dataArr = [];

        for (let y = 0; y < articlesArr.length; y++) {

            let title = articlesArr[y].title;

            if(articlesArr[y].title === null || articlesArr[y].title === "" || articlesArr[y].title === " " || articlesArr[y].title === 'undefined'){
                title = "not specified";
            }

            let value = parseInt(categoryCopy[articlesArr[y].category]);
            dataArr.push([articlesArr[y].title, value, {
                name: title,
                weight: value,
                data: articlesArr[y]
            }]);
        }
        let wl = new WeightedList(dataArr);

        let result = wl.shuffle();

        let returnArr = [];

        for(let t of result){
            returnArr.push(t.data.data);
        }

        return returnArr;

    };

    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    this.orderArticlesBasedOnStringValues = () => {

    };

}