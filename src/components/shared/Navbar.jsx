import React from "react";
import { Link } from "react-router-dom";

import WalletStatus from "./WalletStatus";

const Navbar = (props) => {
  return (
    <div>
      <nav className="navbar navbar-expand bg-light mb-4">
        <div className="container">
          <a className="navbar-brand" href="/">
            TezQF <span className="lead">Rounds</span>
          </a>

          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to="/contribute" className="nav-link">
                  Contribute
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/enter" className="nav-link">
                  Enter
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/sponsor" className="nav-link">
                  Sponsor
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/archive" className="nav-link">
                  Archive
                </Link>
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
