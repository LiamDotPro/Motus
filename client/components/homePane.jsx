import React from "react";
import NewsPane from './NewsPane.jsx';
import UserPane from './UserPane.jsx';

export default class HomePane extends React.Component {
    render() {
        return (
         <div className="row home-pane-panel">
            <UserPane />
            <NewsPane />
         </div>
        );
    }
};