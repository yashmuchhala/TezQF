import React from "react";
import Moment from "react-moment";

//Dummy data
import { executive } from "../../data/executive";
import ArchivedProposal from "../../components/governance/ArchivedProposal";

const Executive = () => {
  const { activeProposal, archivedProposals } = executive;

  return (
    <div>
      {/* Setup Panel */}
      <div className="card">
        <div className="card-body">
          <div className="align-items-center row">
            <div className="col-sm-9">
              <h5 class="card-title">Round Proposal</h5>
              <p class="card-text">
                Create a proposal for a funding round. You must be a holder of
                at least 2000 DAO tokens.
              </p>
            </div>
            <div className="col-sm-3">
              <button className="btn btn-outline-primary btn-block">
                Setup
              </button>
            </div>
          </div>
        </div>
      </div>

      <br />

      {/* Active Proposal */}
      <div className="card">
        <div className="card-body">
          <div className="align-items-center row">
            <div className="col-sm-9">
              <h5 class="card-title">{`Proposal to conduct funding round ${activeProposal.id}`}</h5>
              <p class="card-text">
                {`Round ${activeProposal.id} to be held from `}
                <Moment format="DD-MM-YYYY">{activeProposal.start}</Moment>{" "}
                {" to "}
                <Moment format="DD-MM-YYYY">{activeProposal.end}</Moment>
                {". "}
                <a href="!#" className="text-blue">
                  Read more.
                </a>
              </p>
            </div>
            <div className="col-sm-3">
              <button className="btn btn-outline-success btn-block">
                Vote for Proposal
              </button>
              <p className="mb-0 mt-1 text-center text-secondary">
                {activeProposal.votesYes} votes in support.
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      {/* Archived Proposal */}
      {archivedProposals.map((proposal) => (
        <>
          <ArchivedProposal proposal={proposal} />
          <br />
        </>
      ))}
    </div>
  );
};

export default Executive;
