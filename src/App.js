import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Layout from "./components/shared/Layout";
import Home from "./containers/Home";
import Archive from "./containers/Archive";
import Contribute from "./containers/Contribute";
import Project from "./containers/Project";
import Sponsor from "./containers/Sponsor";
import Profile from "./containers/Profile";

const App = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route exact path="/contribute/:id" component={Project} />
          <Route exact path="/contribute" component={Contribute} />
          <Route path="/sponsor" component={Sponsor} />
          <Route path="/archive" component={Archive} />
          <Route path="/profile" component={Profile} />
        </Switch>
      </Layout>
    </Router>
  );
};

export default App;
