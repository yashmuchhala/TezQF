import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Layout from "./components/shared/Layout";
import Home from "./containers/Home";

//Rounds
import Archive from "./containers/rounds/archive/Archive";
import Contribute from "./containers/rounds/on-going/Contribute";
import Enter from "./containers/rounds/on-going/Enter";
import Project from "./containers/rounds/on-going/Project";
import Profile from "./containers/rounds/on-going/Profile";
import RoundsHome from "./containers/rounds/RoundsHome";
import Sponsor from "./containers/rounds/Sponsor";

//Governance
import Disputes from "./containers/governance/Disputes";
import Executive from "./containers/governance/Executive";

const App = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/" exact component={Home} />
          {/* Rounds Routes */}
          <Route path="/rounds" exact component={RoundsHome} />
          <Route exact path="/rounds/contribute/:id" component={Project} />
          <Route exact path="/rounds/contribute" component={Contribute} />
          <Route exact path="/rounds/enter" component={Enter} />
          <Route path="/rounds/sponsor" component={Sponsor} />
          <Route path="/rounds/archive" component={Archive} />
          <Route path="/rounds/profile" component={Profile} />
          {/* Governance Routes */}
          <Route exact path="/governance/executive" component={Executive} />
          <Route exact path="/governance/disputes" component={Disputes} />
        </Switch>
      </Layout>
    </Router>
  );
};

export default App;
