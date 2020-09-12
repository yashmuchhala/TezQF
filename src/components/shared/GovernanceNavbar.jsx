import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import WalletStatus from "./WalletStatus";

const GovernanceNavbar = () => {
  const wallet = useSelector((state) => state.credentials.wallet);

  return (
    <div>
      <nav
        className="navbar navbar-expand fixed-top bg-light mb-4"
        style={{ borderWidth: "1px" }}
      >
        <div className="container">
          <Link className="navbar-brand" to="/governance">
            TezQF <span className="lead">Governance</span>
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to="/governance/disputes" className="nav-link">
                  Disputes
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/governance/executive" className="nav-link">
                  Executive
                </Link>
              </li>
              <li className="nav-item">
                <WalletStatus wallet={wallet} />
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default GovernanceNavbar;
