import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Layout from "./components/shared/Layout";
import Home from "./containers/Home";

//Rounds
import Archive from "./containers/rounds/archive/Archive";
import ArchiveProfile from "./containers/rounds/archive/ArchiveProfile";
import Projects from "./containers/rounds/on-going/Projects";
import ProjectEntry from "./containers/rounds/on-going/ProjectEntry";
import ProjectProfile from "./containers/rounds/on-going/ProjectProfile";
import Profile from "./containers/rounds/on-going/Profile";
import RoundsHome from "./containers/rounds/RoundsHome";
import Sponsor from "./containers/rounds/Sponsor";

//Governance
import Disputes from "./containers/governance/Disputes";
import Executive from "./containers/governance/Executive";
import ExecutiveVoting from "./containers/governance/ExecutiveVoting";
import DisputeVoting from "./containers/governance/DisputeVoting";

const App = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/" exact component={Home} />
          {/* Rounds Routes */}
          <Route path="/rounds" exact component={RoundsHome} />
          <Route
            exact
            path="/rounds/contribute/:id"
            component={ProjectProfile}
          />
          <Route exact path="/rounds/contribute" component={Projects} />
          <Route exact path="/rounds/enter" component={ProjectEntry} />
          <Route path="/rounds/sponsor" component={Sponsor} />
          <Route path="/rounds/archive/:id" component={ArchiveProfile} />
          <Route path="/rounds/archive" component={Archive} />
          <Route path="/rounds/profile" component={Profile} />
          {/* Governance Routes */}
          <Route
            exact
            path="/governance/executive/:id"
            component={ExecutiveVoting}
          />
          {/* NOTE: Replace with appropraite parameters once the contract is integrated */}
          <Route
            exact
            path="/governance/disputes/:roundId/:id"
            component={DisputeVoting}
          />
          <Route exact path="/governance/executive" component={Executive} />
          <Route exact path="/governance/disputes" component={Disputes} />
        </Switch>
      </Layout>
    </Router>
  );
};

export default App;
