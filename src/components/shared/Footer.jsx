import React from "react";

function Footer() {
  return (
    <div className="text-center" style={{ backgroundColor: "#FAFAFA" }}>
      <hr />
      <div className="row pt-4">
        <div className="col-2"></div>
        <div className="col-2"></div>
        <div className="col-2 font-weight-light mb-3">
          <ul style={{ listStyleType: "none" }}>
            <li>
              <strong>NAVIGATION</strong>
            </li>
            <li>Archives</li>
            <li>Crowdsale</li>
            <li>Governance</li>
          </ul>
        </div>
        <div className="col-2 font-weight-light mb-3">
          <ul style={{ listStyleType: "none" }}>
            <li>
              <strong>ABOUT US</strong>
            </li>
            <li>About</li>
            <li>Contact</li>
            <li>Team</li>
          </ul>
        </div>
        <div className="col-2"></div>
        <div className="col-2"></div>
      </div>
      <div className="mb-4">
        &#169; {new Date().getFullYear()} Tezos India Foundation. All rights
        reserved.
      </div>
    </div>
  );
}

export default Footer;
