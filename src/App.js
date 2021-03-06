import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Layout from "./components/shared/Layout";
import { useDispatch } from "react-redux";
import { ThanosWallet } from "@thanos-wallet/dapp";

//Rounds
import Archive from "./containers/rounds/archives/Archives";
import ArchiveProfile from "./containers/rounds/archives/ArchiveProfile";
import Projects from "./containers/rounds/on-going/Projects";
import ProjectEntry from "./containers/rounds/on-going/ProjectEntry";
import ProjectProfile from "./containers/rounds/on-going/ProjectProfile";
import Home from "./containers/rounds/Home";
import Sponsor from "./containers/rounds/Sponsor";

//Governance
import Disputes from "./containers/governance/Disputes";
import Executive from "./containers/governance/Executive";
import ExecutiveVoting from "./containers/governance/ExecutiveVoting";
import DisputeVoting from "./containers/governance/DisputeVoting";
import RoundProposal from "./containers/governance/RoundProposal";
import DisputeProposal from "./containers/governance/DisputeProposal";
import GovernanceHome from "./containers/governance/Home";

import {
  getRoundStatusAction,
  getRoundsDataAction,
} from "./redux/actions/round";

import {
  getNewRoundProposalsDataAction,
  getDisputesDataAction,
} from "./redux/actions/governance";
import {
  UPDATE_TEZOS,
  SET_CONTRACTS,
  GET_WALLET_DATA,
} from "./redux/ActionTypes";
import ABIs from "./abi/index";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const configureWallet = async () => {
      if (await ThanosWallet.isAvailable()) {
        const w = new ThanosWallet("TezQF");
        await w.connect({
          name: "delphinet",
          rpc: "https://delphinet.smartpy.io",
        });
        const tezos = w.toTezos();
        const accountPkh = await tezos.wallet.pkh();

        const [
          daoContract,
          tokenContract,
          roundManagerContract,
        ] = await Promise.all([
          tezos.wallet.at(process.env.REACT_APP_DAO_CONTRACT_ADDRESS),
          tezos.wallet.at(process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS),
          tezos.wallet.at(process.env.REACT_APP_ROUND_MANAGER_CONTRACT_ADDRESS),
        ]);
        const daoContractObject = new ABIs.DAOContractABI(daoContract);
        const tokenContractObject = new ABIs.TokenContractABI(tokenContract);
        const roundManagerContractObject = new ABIs.RoundManagerContractABI(
          roundManagerContract
        );

        dispatch({
          type: GET_WALLET_DATA,
          payload: { isConnected: true, account: accountPkh },
        });
        dispatch({ type: UPDATE_TEZOS, payload: { tezos } });
        dispatch({
          type: SET_CONTRACTS,
          payload: {
            contracts: {
              dao: daoContractObject,
              token: tokenContractObject,
              roundManager: roundManagerContractObject,
            },
          },
        });
        dispatch(await getRoundStatusAction(roundManagerContractObject));
        dispatch(await getRoundsDataAction(roundManagerContractObject));
        dispatch(await getNewRoundProposalsDataAction(daoContractObject));
        dispatch(await getDisputesDataAction(daoContractObject));
      }
    };
    configureWallet();
  }, [dispatch]);

  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route exact path="/contribute/:id" component={ProjectProfile} />
          <Route exact path="/contribute" component={Projects} />
          <Route exact path="/enter" component={ProjectEntry} />
          <Route path="/sponsor" component={Sponsor} />
          <Route path="/archives/:id" component={ArchiveProfile} />
          <Route path="/archives" component={Archive} />
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
          <Route exec path="/governance" component={GovernanceHome} />
        </Switch>
      </Layout>
    </Router>
  );
};

export default App;
