import React from "react";
import { Link } from "react-router-dom";

const WalletStatus = ({ wallet }) => {
  return wallet.status === "connected" ? (
    <Link
      to="#"
      className="nav-link font-weight-bold text-primary"
      style={{ pointerEvents: "none" }}
    >
      &#176; {wallet.account}
    </Link>
  ) : (
    <Link
      to="#"
      className="nav-link font-weight-bold text-secondary"
      style={{ pointerEvents: "none" }}
    >
      &#176; no wallet connected
    </Link>
  );
};

export default WalletStatus;
