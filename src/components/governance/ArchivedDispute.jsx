import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const ArchivedDispute = ({ roundId, dispute }) => {
  return (
    <div className="mb-3 card">
      <div className="card-body">
        <div className="align-items-center row">
          <div className="col-sm-9">
            <h5 className="card-title">{`Dispute Entry #${dispute.entryId}: ${dispute.title}`}</h5>
            <p className="card-text">
              {dispute.description.length > 100
                ? dispute.description.substring(0, 100) + ".."
                : dispute.description}{" "}
              <Link
                to={`/governance/disputes/${roundId}/${dispute.entryId}`}
                className="text-blue"
              >
                Read more.
              </Link>
            </p>
          </div>
          <div className="col-sm-3">
            {dispute.resolved === 1 ? (
              <>
                <button disabled className="btn btn-danger btn-block">
                  Entry Disqualified
                </button>
                <p className="mb-0 mt-1 text-center text-secondary">
                  {dispute.votesYes} votes in support.
                </p>
              </>
            ) : (
              <>
                <button disabled className="btn btn-success btn-block">
                  Dispute Rejected
                </button>
                <p className="mb-0 mt-1 text-center text-secondary">
                  {dispute.votesNo} votes against.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ArchivedDispute.propTypes = {
  roundId: PropTypes.number.isRequired,
  dispute: PropTypes.object.isRequired,
};

export default ArchivedDispute;
