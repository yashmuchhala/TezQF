import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ThanosWallet } from "@thanos-wallet/dapp";

import GovernanceNavbar from "./GovernanceNavbar";

import { UPDATE_TEZOS, SET_CONTRACTS } from "../../redux/ActionTypes";
import ABIs from "../../abi/index";

import Navbar from "./Navbar";

const Layout = (props) => {
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

        const [
          daoContract,
          crowdSaleContract,
          tokenContract,
          roundManagerContract,
        ] = await Promise.all([
          tezos.wallet.at("KT1W7r8Up9E83DhKTsZgHDX3kbGkiU57iHT5"),
          tezos.wallet.at("KT1Ks4uZcoiKykVieJBuaW9XgmFaYgthBJ9s"),
          tezos.wallet.at("KT1VdfPGgHYBSfgCWhAagQKcPpTWRqs5oDvK"),
          tezos.wallet.at("KT1Dv4PX87fWkW1eaYpQkfyzeeuWVNzb4rWF"),
        ]);

        const daoContractObject = new ABIs.DAOContractABI(daoContract);
        const crowdSaleContractObject = new ABIs.CrowdSaleContractABI(
          crowdSaleContract
        );
        const tokenContractObject = new ABIs.TokenContractABI(tokenContract);
        const roundManagerContractObject = new ABIs.TokenContractABI(
          roundManagerContract
        );

        setWallet({ status: "connected", account: accountPkh });
        dispatch({ type: UPDATE_TEZOS, payload: { tezos } });
        dispatch({
          type: SET_CONTRACTS,
          payload: {
            contracts: {
              dao: daoContractObject,
              crowdSale: crowdSaleContractObject,
              token: tokenContractObject,
              roundManager: roundManagerContractObject,
            },
          },
        });
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
        <Navbar wallet={wallet} />
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
