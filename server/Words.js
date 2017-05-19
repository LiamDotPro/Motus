/**
 * Created by li on 22/04/2017.
 */


var Words = function () {

    var v = require('voca');

    this.wordArr = [];
    this.top10 = [];
    this.top100 = [];

    this.checkString = (str) => {
        for (let x of v.words(str)) {
            if (x.length > 4) {
                this.addWord(x.toLowerCase());
            }

        }
    };

    this.addWord = (word) => {
        this.wordArr.push(word);
    };

    this.getTop100 = () => {
        return this.top100;
    };

    this.getTop10 = () => {
        return this.top10;
    };

    this.getArrOfTopWords = () => {

        //set of banned words
        let bannedWords = new Set(["stuff", "never", "still", "making", "today", "actually", "getting", "better", "about", "sports", "after", "could"]);
        let testWords = this.wordArr.filter(_ => !bannedWords.has(_));

        // accumulator, current value
        // for each word create a key and increase word count value based on if there are more than 0 instance or create new 0 instance
        let counts = testWords.reduce((acc, cur) => {
            acc[cur] = acc[cur] || 0;
            acc[cur]++;
            return acc;
        }, {});

        //sort words in array and return a count alongside the word.
        let result = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(_ => {
            return {count: counts[_], word: _}
        });

        //splice word count into top 10 and top 100
        this.top10 = result.slice(0, 10);
        this.top100 = result.slice(0, 100);

        //reset
        this.wordArr = [];

    };

};

module.exports = Words;