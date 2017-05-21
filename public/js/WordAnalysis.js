/**
 * Created by li on 18/05/2017.
 */


function WordAnalysis(socket) {

    this.analysisProfile = {};
    this.bannedWords = new Set(["stuff", "never", "still", "making", "today", "actually", "getting", "better", "about", "sports", "after", "could", "return", "makes", "being", "brutal", "really", "potential", "during", "people", "bothered", "abruptly", "retiring", "talking", "joined", "given", "having", "reveals"]);

    this.analyzeKeywords = (testString, user) => {

        let testWords = [];

        for (let x of v.words(testString)) {
            if (x.length > 4) {
                testWords.push(x.toLowerCase());
            }
        }


        //filter words based on bannedWords Set
        let filteredWords = testWords.filter(_ => !this.bannedWords.has(_));

        //create counted array of words.
        let counts = filteredWords.reduce((acc, cur) => {
            acc[cur] = acc[cur] || 0;
            acc[cur]++;
            return acc;
        }, {});

        //merge new values into the analysis profile, increase or addition via if statement
        for (let y of Object.keys(counts)) {
            if (this.analysisProfile.hasOwnProperty(y) && y in this.analysisProfile) {
                this.analysisProfile[y] += Number(counts[y]);
            } else {
                this.analysisProfile[y] = Number(1);
            }
        }

        //reset any words
        let profileKeys = Object.keys(this.analysisProfile).filter((el) => {
            return this.bannedWords.has(el);
        });

        //removes the prop from the object using deconstruction delete method.
        for (let t = 0; t < profileKeys.length; t++) {
            delete this.analysisProfile[profileKeys[t]];
        }


        //update the users profile to include the profile
        socket.emit('updateKeywordObject', {
            user: user,
            profile: this.analysisProfile
        });

        console.log(this.analysisProfile);
    };

    //Updates the banned word list
    this.updateBannedWordsList = (newSet) => {
        this.bannedWords = newSet;
    };

    this.reorderArrayBasedOnKeywords = (arrOfArticles) => {

        //analysis profile keys
        let analysisKeys = Object.keys(this.analysisProfile);

        //build a profile of this set of articles
        let testWords = [];
        let itemsForMoving = [];

        for (let x = 0; x < arrOfArticles.length; x++) {

            testWords.push({pos: x, words: []});

            //get all words for each individual article and push into words array inside object.
            for (let y of v.words(arrOfArticles[x].title).filter(_ => !this.bannedWords.has(_))) {
                if (y.length > 4) {
                    testWords[x].words.push(y.toLowerCase());
                }
            }

            for (let t of testWords[x].words) {
                //we only take above 3 on the reference to make sure it's not a shallow match.
                if (analysisKeys.includes(t) && this.analysisProfile[t] > 3) {
                    itemsForMoving.push({arrPos: testWords[x].pos, weighting: this.analysisProfile[t]});
                    break;
                }
            }

        }

        return moveItemsInArray(arrOfArticles, itemsForMoving);


    };

    function moveItemsInArray(articleArr, itemsForMoving) {

        if (itemsForMoving.length > 0) {
            console.log("articles moved up by algorithm");
            console.log(itemsForMoving);
        }

        for (let x of itemsForMoving) {
            //firstly find the maximum possible steps it could move.

            let step = 0;

            if (x.arrPos > 0) {
                step = getRandomArbitrary(1, x.arrPos);
            }

            articleArr = move(articleArr, x.arrPos, x.arrPos - step);

        }

        return articleArr;
    }

    //gets a random number
    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //given an array move based on parameters.
    function move(array, from, to) {
        if (to === from) return array;

        let target = array[from];
        let increment = to < from ? -1 : 1;

        for (let k = from; k != to; k += increment) {
            array[k] = array[k + increment];
        }
        array[to] = target;
        return array;
    }


    this.setProfile = (newProfile) => {
        this.analysisProfile = newProfile;
    }
}