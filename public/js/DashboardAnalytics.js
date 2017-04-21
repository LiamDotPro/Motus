/**
 * Created by li on 21/04/2017.
 */

function DashboardAnalytics(socket) {


    /**
     * Initialises all of the dashboardData
     */
    this.init = () => {
        this.getArticleCount();
        this.getUsers();
        this.getClients();
        this.squareInterval();
    };

    this.squareInterval = () => {
        setInterval(() => {
            this.getArticleCount();
            this.getUsers();
            this.getClients();
        }, 20000)
    };

    this.getArticleCount = () => {
        socket.emit('getArticleCount', {});
    };

    this.getUsers = () => {
        socket.emit('getUserCount', {});
    };

    this.getClients = () => {
        socket.emit('getClientCount', {});
    }
}