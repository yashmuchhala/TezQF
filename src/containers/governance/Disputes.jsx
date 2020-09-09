import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ActiveDispute from "../../components/governance/ActiveDispute";
import ArchivedDispute from "../../components/governance/ArchivedDispute";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const Disputes = () => {
  const [activeDisputes, setActiveDisputes] = useState(null);
  const [archivedDisputes, setArchivedDisputes] = useState([]);

  const { disputes } = useSelector((state) => state.governance);
  const { isRoundActive, currentRound } = useSelector((state) => state.round);

  useEffect(() => {
    if (disputes) {
      if (isRoundActive) {
        setActiveDisputes(disputes[disputes.length - 1]);
      }
      setArchivedDisputes(isRoundActive ? disputes.slice(0, -1) : disputes);
    }
  }, [disputes, isRoundActive]);

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
      {activeDisputes &&
        activeDisputes.forEach(async (dispute, id) => {
          const ipfsContent = JSON.parse(await ipfs.cat(dispute.description));

          return (
            <ActiveDispute
              roundId={currentRound}
              entryId={id}
              key={id}
              reason={ipfsContent.reason}
              description={ipfsContent.description}
              votesYes={dispute.votesYes.toNumber()}
              votesNo={dispute.votesNo.toNumber()}
              resolved={dispute.resolved.toNumber()}
            />
          );
        })}

      <hr className="my-4" />

      {/* Archived Disputes */}
      <div id="accordian">
        {archivedDisputes.map((disputes, index) => (
          <div key={index} className="card">
            <div className="card-header" id={`heading${index}`}>
              {/* <h1 className="mb-0"> */}
              <button
                className="d-flex align-items-center justify-content-between btn btn-block collapsed"
                data-toggle="collapse"
                data-target={`#collapse${index}`}
                aria-expanded="true"
                aria-controls={`collapse${index}`}
              >
                <span style={accordionHeaderStyle}>Round {index + 1}</span>
              </button>
              {/* </h1> */}
            </div>

            <div
              id={`collapse${index}`}
              className="collapse"
              aria-labelledby={`heading${index}`}
              data-parent="#accordion"
            >
              <div className="card-body">
                {disputes.size === 0 ? (
                  <p className="text-center mb-0">No disputes to show.</p>
                ) : (
                  disputes.forEach(async (dispute, id) => {
                    const ipfsContent = JSON.parse(
                      await ipfs.cat(dispute.description)
                    );

                    return (
                      <ArchivedDispute
                        roundId={currentRound}
                        entryId={id}
                        key={id}
                        reason={ipfsContent.reason}
                        description={ipfsContent.description}
                        votesYes={dispute.votesYes.toNumber()}
                        votesNo={dispute.votesNo.toNumber()}
                        resolved={dispute.resolved.toNumber()}
                      />
                    );
                  })
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
