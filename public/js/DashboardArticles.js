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


}