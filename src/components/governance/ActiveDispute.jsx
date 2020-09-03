import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const ActiveDispute = ({ roundId, dispute }) => {
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
            <Link
              to={`/governance/disputes/${roundId}/${dispute.entryId}`}
              style={{ textDecoration: "none" }}
            >
              <button className="btn btn-outline-success btn-block">
                Vote for Dispute
              </button>
            </Link>
            <p className="mb-0 mt-1 text-center text-secondary">
              {dispute.votesYes} votes in support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

ActiveDispute.propTypes = {
  roundId: PropTypes.number.isRequired,
  dispute: PropTypes.object.isRequired,
};

export default ActiveDispute;
