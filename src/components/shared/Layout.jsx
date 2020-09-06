import React from "react";
import GovernanceNavbar from "./GovernanceNavbar";
import Navbar from "./Navbar";

const Layout = (props) => {
  //Check if the url is of the governance page or rounds page and return the navbar accordingly.

  const getNav = () => {
    const url = window.location.pathname;
    const regEx = new RegExp("governance", "gi");

    if (url === "/") {
      return <Navbar />;
    } else {
      return url.match(regEx) ? <GovernanceNavbar /> : <Navbar />;
    }
  };

  return (
    <div>
      {getNav()}
      <div className="container">{props.children}</div>
    </div>
  );
};

export default Layout;
