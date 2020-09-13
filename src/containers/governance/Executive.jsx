import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ArchivedProposal from "../../components/governance/ArchivedProposal";
import ActiveProposal from "../../components/governance/ActiveProposal";

const Executive = () => {
  const [isDataFetchComplete, setIsDataFetchComplete] = useState(false);
  const { newRoundProposals, newRoundProposalActive } = useSelector(
    (state) => state.governance
  );
  useEffect(() => {
    if (newRoundProposals?.length !== 0) {
      setIsDataFetchComplete(true);
    }
  }, [newRoundProposals]);
  const activeProposal = newRoundProposalActive
    ? newRoundProposals[newRoundProposals.length - 1]
    : null;
  const archivedProposals = newRoundProposalActive
    ? newRoundProposals.slice(0, -1)
    : newRoundProposals;

  /*
    TODO: Add a loader for proposal loading
  */

  return (
    <div>
      {/* Setup Panel */}
      <div className="card">
        <div className="card-body p-5" style={{ backgroundColor: "#FAFAFA" }}>
          <div className="align-items-center row">
            <div className="col-sm-9">
              <h5
                className="card-title text-secondary text-center"
                style={{ fontSize: "32px" }}
              >
                <strong>NEW ROUND PROPOSAL STATUS</strong>
              </h5>
              <p className="card-text text-center pl-5 pr-5">
                Information about the current new round proposals. Vote for an
                on-going proposal or start a new proposal by staking the minimum
                number of tokens required.
              </p>
            </div>
            <div className="col-sm-3">
              <Link
                to="/governance/executive/new"
                style={{ textDecoration: "none" }}
              >
                <button
                  disabled={newRoundProposalActive}
                  className="btn btn-outline-primary btn-block p-3"
                >
                  {isDataFetchComplete ? (
                    newRoundProposalActive ? (
                      "Proposal on-going"
                    ) : (
                      "Setup"
                    )
                  ) : (
                    <div>
                      <div className="spinner-grow spinner-grow-sm text-primary"></div>
                      <div className="spinner-grow spinner-grow-sm text-primary ml-2 mr-2"></div>
                      <div className="spinner-grow spinner-grow-sm text-primary "></div>
                    </div>
                  )}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <br />

      {/* Active Proposal */}
      {activeProposal !== null ? (
        <ActiveProposal
          id={activeProposal.id.toNumber()}
          start={activeProposal.start.toString()}
          end={activeProposal.end.toString()}
          votesYes={activeProposal.votesYes.toNumber()}
          votesNo={activeProposal.votesNo.toNumber()}
          resolved={activeProposal.resolved.toNumber()}
        />
      ) : (
        <></>
      )}

      <hr className="my-4" />

      {/* Archived Proposals */}
      {archivedProposals.length !== 0 ? (
        archivedProposals.map((proposal, index) => (
          <ArchivedProposal
            key={index}
            id={proposal.id}
            start={proposal.start.toString()}
            end={proposal.end.toString()}
            votesYes={proposal.votesYes.toNumber()}
            votesNo={proposal.votesYes.toNumber()}
            resolved={proposal.resolved.toNumber()}
          />
        ))
      ) : (
        <p className="text-center p-5">No Archived Proposals</p>
      )}
    </div>
  );
};

export default Executive;
