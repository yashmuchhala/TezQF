import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import WalletStatus from "./WalletStatus";

const Navbar = () => {
  const wallet = useSelector((state) => state.credentials.wallet);
  return (
    <div>
      <nav
        className="navbar navbar-expand fixed-top bg-light mb-4"
        style={{ borderWidth: "1px" }}
      >
        <div className="container">
          <Link className="navbar-brand" to="/">
            TezQF <span className="lead">Rounds</span>
          </Link>

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
