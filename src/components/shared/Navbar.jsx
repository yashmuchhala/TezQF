import React from "react";
import WalletStatus from "./WalletStatus";

const Navbar = (props) => {
  return (
    <div>
      <nav className="navbar navbar-expand bg-light mb-4">
        <div className="container">
          <a className="navbar-brand" href="/">
            TezQF
          </a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a href="/rounds" className="nav-link">
                  Rounds
                </a>
              </li>
              <li className="nav-item">
                <a href="/governance/executive" className="nav-link">
                  Governance
                </a>
              </li>
              <li className="nav-item">
                <WalletStatus wallet={props.wallet} />
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
