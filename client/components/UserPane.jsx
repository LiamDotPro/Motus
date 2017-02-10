import React from "react";
import UserTile from './UserTile.jsx';
import UserReadingList from './UserReadingList.jsx';
import UserQuestion from './userQuestion.jsx';

export default class UserPane extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ip:"pending",
            loc: "pending"
        };
    }

    updateCall() {
        console.log(this.updateID);
    }

    componentDidMount() {
        this.response = this.getIP();
        this.setState({
            ip: this.response.ip,
            loc: this.response.loc
        });
    }

    async getIP() {
        const result = await fetch("http://ipinfo.io");
        console.log(result);
    }

    render() {
        return (
            <div className="col-xs-12 col-md-3 home-pane-user nopad">
                <UserTile userName="Annonymous" loc={this.state.loc} ip={this.state.ip} />
                <UserReadingList />
                <UserQuestion />
            </div>
        );
    }
};