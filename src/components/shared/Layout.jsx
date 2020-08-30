import React, { useState, useEffect } from "react";
import { ThanosWallet } from "@thanos-wallet/dapp";

import Navbar from "./Navbar";

const Layout = (props) => {
  const [wallet, setWallet] = useState({
    status: "not connected",
    account: "",
  });
  const [tezos, setTezos] = useState();

  useEffect(() => {
    const connectThanos = async () => {
      if (await ThanosWallet.isAvailable()) {
        const wallet = new ThanosWallet("TezQF");
        await wallet.connect("carthagenet");
        const tezos = wallet.toTezos();
        const accountPkh = await tezos.wallet.pkh();
        setWallet({ status: "connected", account: accountPkh });
        setTezos(tezos);
      }
    };

    connectThanos();
  }, []);

  return (
    <div>
      <Navbar wallet={wallet} />
      <div className="container">{props.children}</div>
    </div>
  );
};

export default Layout;
