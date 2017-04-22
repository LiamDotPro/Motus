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

        let bannedWords = new Set(["stuff", "never", "still", "making", "today", "actually", "getting", "better"]);
        let testWords = this.wordArr.filter(_ => !bannedWords.has(_));

        let counts = testWords.reduce((acc, cur) => {
            acc[cur] = acc[cur] || 0;
            acc[cur]++;
            return acc;
        }, {});

        let result = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(_ => {
            return {count: counts[_], word: _}
        });

        this.top10 = result.slice(0, 10);
        this.top100 = result.slice(0, 100);

        this.wordArr = [];

    };

};

module.exports = Words;