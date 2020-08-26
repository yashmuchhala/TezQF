import React, { Component } from "react";

import { Link } from "react-router-dom";

export class Navbar extends Component {
  render() {
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
                color:
                  this.props.wallet.status === "connected" ? "green" : "red",
              }}
            >
              {this.props.wallet.status}
            </div>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to="/contribute">
                    <a className="nav-link" href="/contribute">
                      Contribute
                    </a>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/sponsor">
                    <a className="nav-link" href="/sponsor">
                      Sponsor
                    </a>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/archive">
                    <a className="nav-link" href="/archive">
                      Archive
                    </a>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link to="/archive">
                    <a className="nav-link" href="/me">
                      {this.props.wallet.account}
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

export default Navbar;
