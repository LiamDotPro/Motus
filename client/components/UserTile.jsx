import React from "react";

export default class UserTile extends React.Component {
    render() {
        return (
            <div className="col-xs-12 user-tile-col">
                <div className="user-tile">
                    <div className="user-thumbnail">
                    <img src="client/images/default/thumbnail/default-thumbnail-wallpaper.jpg" alt="Add some flair to your news profile"></img>
                </div>
                <div className="user-stats text-center row">
                    <div className="col-md-12">
                        <h5><i className="fa fa-calendar"></i> <span id="datetime"></span></h5>
                    </div>
                </div>
                <div className="user-info text-center">
                    <h3>{this.props.userName}</h3>
                    <p>{this.props.loc}</p>
                    <p>{this.props.ip}</p>
                </div>
                <div className="user-actions text-center">
                    <a className="btn btn-action" href="">Register</a>
                    <a className="btn btn-action" href="">Sign in</a>
                </div>
            </div>
        </div>
        );
    }
};