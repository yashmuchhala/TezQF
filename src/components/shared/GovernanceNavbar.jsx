import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import WalletStatus from "./WalletStatus";

const GovernanceNavbar = () => {
  const wallet = useSelector((state) => state.credentials.wallet);

  return (
    <div>
      <nav
        className="navbar navbar-expand bg-light mb-4 p-3"
        style={{
          borderBottomWidth: "0px",
        }}
      >
        <div className="container">
          <Link className="navbar-brand text-primary" to="/governance">
            tezGrants{" "}
            <span className="lead badge badge-secondary">Governance</span>
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link
                  to="/governance/executive"
                  className="nav-link text-secondary"
                >
                  Executive
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/governance/disputes"
                  className="nav-link text-secondary"
                >
                  Disputes
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
