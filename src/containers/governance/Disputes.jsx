import React from "react";
import { Link } from "react-router-dom";

import ActiveDispute from "../../components/governance/ActiveDispute";
import ArchivedDispute from "../../components/governance/ArchivedDispute";

//Dummy data
import { disputes } from "../../data/disputes";

const Disputes = () => {
  const activeDisputes = disputes[disputes.length - 1];
  const archivedDisputes = disputes.slice(0, -1);

  return (
    <div>
      {/* Setup Panel */}
      <div className="card">
        <div className="card-body">
          <div className="align-items-center row">
            <div className="col-sm-9">
              <h5 className="card-title">Raise Dispute</h5>
              <p className="card-text">
                Raise a dispute against any project that violates the integrity
                of the community. You must be a holder of at least 2000 DAO
                tokens.
              </p>
            </div>
            <div className="col-sm-3">
              <Link
                to="/governance/disputes/new"
                style={{ textDecoration: "none" }}
              >
                <button className="btn btn-outline-primary btn-block">
                  Setup
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <br />

      {/* Active Disputes */}

      {/* Remove roundId after contract contract integration */}
      {activeDisputes.disputes.map((dispute) => (
        <ActiveDispute
          roundId={activeDisputes.roundId}
          key={dispute.entryId}
          dispute={dispute}
        />
      ))}

      <hr className="mb-3" />

      {/* Archived Disputes */}
      <div id="accordian">
        {archivedDisputes.map((round) => (
          <div key={round.roundId} className="card">
            <div className="card-header" id={`heading${round.roundId}`}>
              {/* <h1 className="mb-0"> */}
              <button
                className="d-flex align-items-center justify-content-between btn btn-block collapsed"
                data-toggle="collapse"
                data-target={`#collapse${round.roundId}`}
                aria-expanded="true"
                aria-controls={`collapse${round.roundId}`}
              >
                <span style={accordionHeaderStyle}>Round {round.roundId}</span>
              </button>
              {/* </h1> */}
            </div>

            <div
              id={`collapse${round.roundId}`}
              className="collapse"
              aria-labelledby={`heading${round.roundId}`}
              data-parent="#accordion"
            >
              <div className="card-body">
                {round.disputes.length === 0 ? (
                  <p className="text-center mb-0">No disputes to show.</p>
                ) : (
                  round.disputes.map((dispute) => (
                    <ArchivedDispute
                      roundId={round.roundId}
                      key={dispute.entryId}
                      dispute={dispute}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const accordionHeaderStyle = {
  fontSize: "1.2rem",
  fontWeight: "bold",
};

export default Disputes;
