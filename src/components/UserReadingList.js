import React from 'react';
import "../stylesheets/main.scss";

export default class UserReadingList extends React.Component {
    render() {
        return (
              <div className="col-md-12 user-reading-col">
                <div className="user-tile">
                    <div className="text-center">
                        <h3>Your Pinned Articles</h3>
                    </div>
                    <div className="pinned-articles">
                        <ul>
                            <li>
                                <a href="">Hello World</a>
                                <p> - A short introduction to life</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
