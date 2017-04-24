/**
 * Created by li on 22/04/2017.
 */


var SourceAnalytics = function () {

    this.sourceData = {};

    /**
     * Adds a new property to the sourceData object.
     * @param newSourceProp String
     */
    this.addSourceProp = (newSourceProp) => {
        this.sourceData[newSourceProp] = 0;
    };

    /**
     * Processes Articles and increases the corresponding count of articles.
     * @param source
     */
    this.processSourceData = (source) => {
        this.sourceData[source]++;
    };

    /**
     * Gets the source Data Object.
     * @returns {{}|*}
     */
    this.getSourceData = () => {
        return this.sourceData;
    };

};

module.exports = SourceAnalytics;