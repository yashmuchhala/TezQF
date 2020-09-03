import React from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Link } from "react-router-dom";

const ArchivedProposal = ({ proposal }) => {
  return (
    <div className="mb-3 card">
      <div className="card-body">
        <div className="align-items-center row">
          <div className="col-sm-9">
            <h5 className="card-title">{`Proposal to conduct funding round ${proposal.id}`}</h5>
            <p className="card-text">
              {`Round ${proposal.id} to be held from `}
              <Moment format="DD-MM-YYYY">{proposal.start}</Moment> {" to "}
              <Moment format="DD-MM-YYYY">{proposal.end}</Moment>
              {". "}
              <Link
                to={`/governance/executive/${proposal.id}`}
                className="text-blue"
              >
                Read more.
              </Link>
            </p>
          </div>

          <div className="col-sm-3">
            {proposal.resolved === 1 ? (
              <>
                <button disabled className="btn btn-success btn-block">
                  Accepted
                </button>
                <p className="mb-0 mt-1 text-center text-secondary">
                  {proposal.votesYes} votes in support.
                </p>
              </>
            ) : (
              <>
                <button disabled className="btn btn-danger btn-block">
                  Rejected
                </button>
                <p className="mb-0 mt-1 text-center text-secondary">
                  {proposal.votesNo} votes against.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ArchivedProposal.propTypes = {
  proposal: PropTypes.object.isRequired,
};

export default ArchivedProposal;
