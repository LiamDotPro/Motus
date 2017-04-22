/**
 * Created by li on 21/04/2017.
 */

function DashboardAnalytics(socket) {

    this.graphInstance = null;

    /**
     * Initialises all of the dashboardData - Facade for data grabbing.
     */
    this.init = () => {
        this.getArticleCount();
        this.getUsers();
        this.getClients();
        this.getGraphData();
        this.getPieChartData();
        this.getTrendingWords();

        /**
         * Interval Calls
         */
        this.squareInterval();
    };

    this.squareInterval = () => {
        setInterval(() => {
            this.getArticleCount();
            this.getUsers();
            this.getClients();
        }, 20000);
    };

    this.getArticleCount = () => {
        socket.emit('getArticleCount', {});
    };

    this.getUsers = () => {
        socket.emit('getUserCount', {});
    };

    this.getClients = () => {
        socket.emit('getClientCount', {});
    };

    this.getGraphData = () => {
        socket.emit('getGraphData', {})
    };

    this.getPieChartData = () => {
        socket.emit('getCategoryData', {});
    };

    this.getTrendingWords = () => {
        socket.emit('getTrendingWords', {});
    };

    this.formatGraphData = (arr, currentCount) => {

        let tempLabelArr = [];
        let tempCountArr = [];

        for (let x = 0; x < arr.length; x++) {
            let tempLabel = moment(arr[x][2] + "-" + arr[x][1] + "-" + arr[x][0], "YYYY-MM-DD");
            tempLabelArr.push(tempLabel.format('dddd'));
            tempCountArr.push(arr[x][3]);
        }

        let today = moment();
        tempLabelArr.push("Today (" + today.format("dddd") + ")");
        tempCountArr.push(currentCount);

        return [tempLabelArr, tempCountArr];

    };

    this.setGraphInstance = (instance) => {
        this.graphInstance = instance;
    };

    this.getGraphInstance = () => {
        return this.graphInstance;
    };

    this.formatPieData = (obj) => {

        var keys = Object.keys(obj);
        var arrOfData = [obj.general, obj.sport, obj.technology, obj.business, obj.entertainment, obj.science_and_nature];

        return [keys, arrOfData];


    };

    this.formatBarData = (arr) => {

        let tempLabelArr = [];
        let tempCountArr = [];

        for (let x of arr) {
            tempLabelArr.push(x.word);
            tempCountArr.push(x.count);
        }

        return [tempLabelArr, tempCountArr];
    }

}