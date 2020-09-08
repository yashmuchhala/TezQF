import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ArchivedProposal from "../../components/governance/ArchivedProposal";
import ActiveProposal from "../../components/governance/ActiveProposal";

const Executive = () => {
  const { newRoundProposals, newRoundProposalActive } = useSelector(
    (state) => state.governance
  );

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
        <div className="card-body">
          <div className="align-items-center row">
            <div className="col-sm-9">
              <h5 className="card-title">Round Proposal</h5>
              <p className="card-text">
                Create a proposal for a funding round. You must be a holder of
                at least 2000 DAO tokens.
              </p>
            </div>
            <div className="col-sm-3">
              <Link
                to="/governance/executive/new"
                style={{ textDecoration: "none" }}
              >
                <button
                  disabled={newRoundProposalActive}
                  className="btn btn-outline-primary btn-block"
                >
                  {newRoundProposalActive ? "Proposal on-going" : "Setup"}
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
        <p className="text-center">No Archived Proposals</p>
      )}
    </div>
  );
};

export default Executive;
