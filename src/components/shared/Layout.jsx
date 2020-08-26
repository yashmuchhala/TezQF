import Navbar from "./Navbar";
import React, { Component } from "react";

import { ThanosWallet } from "@thanos-wallet/dapp";

export class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: {
        status: "not connected",
        account: "",
      },
      tezos: null,
    };
  }

  async componentDidMount() {
    if (await ThanosWallet.isAvailable()) {
      const wallet = new ThanosWallet("My Super DApp");
      await wallet.connect("carthagenet");
      const tezos = wallet.toTezos();
      const accountPkh = await tezos.wallet.pkh();
      this.setState({
        wallet: { status: "connected", account: accountPkh },
        tezos: tezos,
      });
    }
  }
  render() {
    return (
      <div>
        <Navbar wallet={this.state.wallet} />
        <div className="container">{this.props.children}</div>
      </div>
    );
  }
}

export default Layout;
