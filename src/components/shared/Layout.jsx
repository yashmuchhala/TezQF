import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ThanosWallet } from "@thanos-wallet/dapp";

import RoundsNavbar from "./RoundsNavbar";
import GovernanceNavbar from "./GovernanceNavbar";

import { UPDATE_TEZOS } from "../../redux/ActionTypes";
import Navbar from "./Navbar";

import config from "../../../contractsConfig.json";
import {
  crowdSaleContractABI,
  tokenContractABI,
  daoContractABI,
  roundManagerContractABI,
} from "../../abi";

const Layout = (props) => {
  const [crowdSaleContract, setCrowdSaleContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [daoContract, setDAOContract] = useState(null);
  const [roundManagerContract, setRoundManagerContract] = useState(null);

  const [wallet, setWallet] = useState({
    status: "not connected",
    account: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    const configureWallet = async () => {
      if (await ThanosWallet.isAvailable()) {
        const wallet = new ThanosWallet("TezQF");
        await wallet.connect("carthagenet");
        const tezos = wallet.toTezos();
        const accountPkh = await tezos.wallet.pkh();
        setWallet({ status: "connected", account: accountPkh });
        setCrowdSaleContract(
          crowdSaleContractABI(tezos, config.crowdSaleContractAddress)
        );
        dispatch({ type: UPDATE_TEZOS, payload: { tezos } });
      }
    };
    configureWallet();
  }, [dispatch]);

  //Check if the url is of the governance page or rounds page and return the navbar accordingly.
  const getNav = () => {
    const url = window.location.pathname;
    const regEx = new RegExp("governance", "gi");

    if (url === "/") {
      return <Navbar wallet={wallet} />;
    } else {
      return url.match(regEx) ? (
        <GovernanceNavbar wallet={wallet} />
      ) : (
        <RoundsNavbar wallet={wallet} />
      );
    }
  };

  return (
    <div>
      {getNav()}
      <div className="container">{props.children}</div>
    </div>
  );
};

export default Layout;
