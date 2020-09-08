import React from "react";

function SponsorRoundActive() {
  return (
    <div>
      Next funding round begins in [time], if you want to donate to the fund
      <button className="btn btn-primary">
        <a href="/sponsor">Click here</a>
      </button>
    </div>
  );
}

export default SponsorRoundActive;
