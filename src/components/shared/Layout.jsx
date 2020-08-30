import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ThanosWallet } from "@thanos-wallet/dapp";

import Navbar from "./Navbar";

import { UPDATE_TEZOS } from "../../redux/ActionTypes";

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
        setWallet({ status: "connected", account: accountPkh });
        dispatch({ type: UPDATE_TEZOS, payload: { tezos } });
      }
    };
    configureWallet();
  }, [dispatch]);

  return (
    <div>
      <Navbar wallet={wallet} />
      <div className="container">{props.children}</div>
    </div>
  );
};

export default Layout;
