import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import RoundActive from "../../components/rounds/RoundActive";
// import SponsorActiveRound from "../../components/rounds/SponsorRoundActive";
import NoActiveRound from "../../components/rounds/NoActiveRound";
const Home = () => {
  const isRoundActive = useSelector((state) => state.round.isRoundActive);
  const rounds = useSelector((state) => state.round.rounds);

  const currentRound = isRoundActive ? rounds[rounds.length - 1] : null;

  console.log(currentRound);
  return (
    <div>
      <h1 className="font-weight-light mb-3">
        TezQF Crowd-Funding for Public Goods with Quadratic Voting
      </h1>
      <Link to="/enter">
        <button className="btn btn-success mr-3">Enter Round</button>
      </Link>
      <Link to="/crowdsale">
        <button className="btn btn-success mr-3">Buy Governance Tokens</button>
      </Link>
      <button className="btn btn-primary mr-3">Know More</button>
      <a href="/governance" style={{ color: "white" }}>
        <button className="btn btn-secondary">Governance</button>
      </a>
      <hr />
      {currentRound ? (
        <RoundActive
          name={currentRound.name}
          sponsors={currentRound.sponsors.size}
          funds={currentRound.totalSponsorship.toNumber()}
        />
      ) : (
        <NoActiveRound />
      )}
    </div>
  );
};

export default Home;
