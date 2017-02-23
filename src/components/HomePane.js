import React from "react";
import { createStore } from 'redux';
import NewsPane from './NewsPane.js';
import UserPane from './UserPane.js';



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
