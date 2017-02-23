import React from "react";
import "../stylesheets/main.scss";
import {createStore} from 'redux';
import articlesReducer from '../reducers/articles';

const store = createStore(articlesReducer);


export default class NewsPane extends React.Component {

  componentWillMount() {
    console.log('News Articles component has loaded');
    store.dispatch('GET_MORE_ARTICLES');
  }

  render() {
    console.log(store.getState());
    return (
      <div className="col-xs-9 home-pane-main nopad">
        <div className="news-hub">

        </div>
      </div>
    );
  }
};
