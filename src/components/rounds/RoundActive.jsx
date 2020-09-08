import React from "react";

function RoundActive({ name, sponsors, funds }) {
  return (
    <div>
      <h4 className="text-center mt-5">
        Funding Round {name} is here! We have {sponsors} sponsors bringing in
        XTZ {funds} to the match pool. <a href="/contribute">Contribute</a> now
        to your favourite projects
      </h4>
    </div>
  );
}

export default RoundActive;
