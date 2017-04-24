/**
 * Created by li on 24/04/2017.
 */

function UserAnalytics(socket) {


    this.init = () => {
        this.getUserTableData();
    };

    this.getUserTableData = () => {
        socket.emit("getUserTableData", {});
    }

}