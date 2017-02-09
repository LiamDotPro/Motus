import React from "react";
import UserTile from './UserTile.jsx';
import UserReadingList from './UserReadingList.jsx';
import UserQuestion from './userQuestion.jsx';

export default class UserPane extends React.Component {
    render() {
        return (
            <div className="col-xs-12 col-md-3 home-pane-user nopad">
                <UserTile />
                <UserReadingList />
                <UserQuestion />
            </div>
        );
    }
};