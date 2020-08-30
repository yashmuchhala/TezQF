import React from "react";

import { Link } from "react-router-dom";

const Navbar = (props) => {
  return (
    <div>
      <nav className="navbar navbar-expand bg-light mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/">
            TezQF
          </Link>
          <div
            style={{
              size: "5",
              color: props.wallet.status === "connected" ? "green" : "red",
            }}
          >
            {props.wallet.status}
          </div>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to="/contribute" className="nav-link">
                  Contribute
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
                <Link to="/archive" className="nav-link">
                  {props.wallet.account}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
