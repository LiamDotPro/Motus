import React from "react";
import {Router, Route, IndexRoute} from "react-router";
import {history} from "./store.js";
import HomePane from "./components/HomePane.js";
import NotFound from "./components/NotFound.js";


// build the router
const router = (
  <Router onUpdate={() => window.scrollTo(0, 0)} history={history}>
    <Route path="/" component={HomePane}>
      <IndexRoute component={HomePane}/>
      <Route path="*" component={NotFound}/>
    </Route>
  </Router>
);

// export
export {router};
