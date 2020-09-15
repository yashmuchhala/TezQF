import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import RoundActive from "../../components/rounds/RoundActive";
// import SponsorActiveRound from "../../components/rounds/SponsorRoundActive";
import NoActiveRound from "../../components/rounds/NoActiveRound";
const Home = () => {
  const isRoundActive = useSelector((state) => state.round.isRoundActive);
  const rounds = useSelector((state) => state.round.rounds);

  const currentRound = isRoundActive ? rounds[rounds.length - 1] : -1;

  return (
    <div>
      <div
        style={{
          backgroundImage: `url(assets/images/home-background5.jpg)`,
          backgroundSize: "cover",
        }}
      >
        <h1
          className="font-weight-light pl-3 mb-3"
          style={{ fontSize: "64px" }}
        >
          <br />
          <i>
            Crowd funding for
            <br />
            <span style={{ fontWeight: 600 }}>public goods</span>
            <br />
            with
          </i>{" "}
          Quadratic
          <br /> Voting.
          <Link to={currentRound ? "/contribute" : "/archives"}>
            <button
              type="button"
              className="btn btn-primary mb-3 ml-3 p-3 pr-3 pl-3"
            >
              Browse Projects
            </button>
          </Link>
        </h1>
        <div
          className="container"
          style={{
            paddingTop: "200px",
            paddingBottom: "40px",
            color: "lightgrey",
          }}
        >
          &#8595; scroll down for more info
        </div>
      </div>
      {!currentRound ? (
        <div className="text-center">
          <div className="spinner-grow spinner-grow-sm text-primary"></div>
          <div className="spinner-grow spinner-grow-sm text-primary ml-2 mr-2"></div>
          <div className="spinner-grow spinner-grow-sm text-primary "></div>
        </div>
      ) : currentRound !== -1 ? (
        <RoundActive
          name={currentRound.name}
          funds={currentRound.totalSponsorship.toNumber()}
        />
      ) : (
        <NoActiveRound />
      )}
      <hr />
      <div className="text-center p-5">
        <div className="row">
          <div
            className="col-4"
            style={{ fontSize: "48px", fontWeight: "600" }}
          >
            100+<h5 style={{ color: "lightgrey" }}> projects funded</h5>
          </div>
          <div
            className="col-4"
            style={{ fontSize: "48px", fontWeight: "600" }}
          >
            30,000+{" "}
            <h5 style={{ color: "lightgrey" }}>XTZ in total donations</h5>
          </div>
          <div
            className="col-4"
            style={{ fontSize: "48px", fontWeight: "600" }}
          >
            100,000+
            <h5 style={{ color: "lightgrey" }}>XTZ in total grants</h5>
          </div>
        </div>
      </div>
      <hr />
      <div className="text-center pl-5 pr-5 pt-3 pb-5">
        <h3 className="m-5">
          Our funding rounds are governed by a{" "}
          <h1 className="text-success">
            <i>Decentralized Autonomous Organization</i>
          </h1>
        </h3>
        <h6 className="text-muted">To explore, click on "Go to Governance"</h6>
        <a href="/governance" style={{ color: "white" }}>
          <button className="btn btn-secondary p-3 mr-3 mb-5">
            Go to Governance
          </button>
        </a>
        <Link to="/crowdsale">
          <button className="btn btn-success p-3 mb-5">
            Buy Governance Tokens*
          </button>
        </Link>
        <h6 className="text-muted">
          *Our governance tokens are very restrictive and not listed on any
          exchanges;
          <br /> their primary purpose is to maintain voting weights within the
          organization.
        </h6>
      </div>
    </div>
  );
};

export default Home;
