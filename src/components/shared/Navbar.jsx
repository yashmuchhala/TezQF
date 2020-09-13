import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import WalletStatus from "./WalletStatus";

const Navbar = () => {
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
          <Link className="navbar-brand text-primary" to="/">
            tezGrants
          </Link>

          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to="/contribute" className="nav-link text-secondary">
                  Contribute
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/enter" className="nav-link text-secondary">
                  Enter
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/sponsor" className="nav-link text-secondary">
                  Sponsor
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/archives" className="nav-link text-secondary">
                  Archives
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

export default Navbar;
