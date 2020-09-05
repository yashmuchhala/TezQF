import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/shared/Layout";

//Rounds
import Archive from "./containers/rounds/archive/Archive";
import ArchiveProfile from "./containers/rounds/archive/ArchiveProfile";
import Projects from "./containers/rounds/on-going/Projects";
import ProjectEntry from "./containers/rounds/on-going/ProjectEntry";
import ProjectProfile from "./containers/rounds/on-going/ProjectProfile";
import Profile from "./containers/rounds/on-going/Profile";
import Home from "./containers/rounds/Home";
import Sponsor from "./containers/rounds/Sponsor";

//Governance
import Disputes from "./containers/governance/Disputes";
import Executive from "./containers/governance/Executive";
import ExecutiveVoting from "./containers/governance/ExecutiveVoting";
import DisputeVoting from "./containers/governance/DisputeVoting";
import RoundProposal from "./containers/governance/RoundProposal";
import DisputeProposal from "./containers/governance/DisputeProposal";

const App = () => {
  const contracts = useSelector((state) => state.contract.contracts);
  console.log(contracts);
  return (
    <Router>
      <Layout>
        <Switch>
          {/* Rounds Routes */}
          <Route path="/" exact component={Home} />
          <Route exact path="/contribute/:id" component={ProjectProfile} />
          <Route exact path="/contribute" component={Projects} />
          <Route exact path="/enter" component={ProjectEntry} />
          <Route path="/sponsor" component={Sponsor} />
          <Route path="/archive/:id" component={ArchiveProfile} />
          <Route path="/archive" component={Archive} />
          <Route path="/profile" component={Profile} />
          {/* Governance Routes */}
          <Route
            exact
            path="/governance/executive/new"
            component={RoundProposal}
          />
          <Route
            exact
            path="/governance/executive/:id"
            component={ExecutiveVoting}
          />
          {/* NOTE: Replace with appropraite parameters once the contract is integrated */}
          <Route
            exact
            path="/governance/disputes/new"
            component={DisputeProposal}
          />
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
