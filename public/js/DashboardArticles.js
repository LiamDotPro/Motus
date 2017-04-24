/**
 * Created by li on 22/04/2017.
 */

function DashboardArticles(socket) {


    this.getData = () => {
        this.getArticles();
        this.getSourcesGraphData();
    };

    this.getArticles = () => {
        socket.emit('getArticleDataForTables', {});
    };

    this.getSourcesGraphData = () => {
        socket.emit('getSourcesGraphData', {});
    };

    this.formatSourceData = (obj) => {

        let keys = [];
        let tempDataArr = [];

        var array = $.map(obj, function (value, index) {
            return [[index, value]];
        });

        /**
         * @return {number}
         */
        function Comparator(a, b) {
            if (a[1] > b[1]) return -1;
            if (a[1] < b[1]) return 1;
            return 0;
        }

        output = array.sort(Comparator);

        for (let x = 0; x < output.length; x++) {
            keys.push(output[x][0]);
            tempDataArr.push(output[x][1]);
        }

        return [keys, tempDataArr];
    };


}