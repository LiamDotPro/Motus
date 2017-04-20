/**
 * Created by li on 20/04/2017.
 */

function Dashboard(socket) {

    this.loggedInUser = null;

    this.getUserObj = (email) => {
        socket.emit('getUserObject', {
            user: email
        })
    };

    this.setupUserObj = (userObj) => {
        let tempUser = new User();
        tempUser.setId(userObj.id);
        tempUser.setEmail(userObj.email);
        tempUser.setAdmin(userObj.admin);
        this.loggedInUser = tempUser;
    };

    this.getLoggedInUser = () => {
        return this.loggedInUser;
    };

    this.checkAdminStatus = () => {
        return !!this.loggedInUser.getAdmin();
    };


}