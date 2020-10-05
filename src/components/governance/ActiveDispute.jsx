import React from "react";
import { Link } from "react-router-dom";

const ActiveDispute = ({
  roundId,
  votesNo,
  votesYes,
  resolved,
  reason,
  description,
  entryId,
}) => {
  return (
    <div className="mb-3 card">
      <div className="card-body p-5">
        <div className="align-items-center row">
          <div className="col-sm-9">
            <h5
              className="card-title text-secondary"
              style={{ fontSize: "32px", fontWeight: 600 }}
            >{`Dispute Entry #${entryId}: ${reason}`}</h5>
            <p className="card-text">
              {description.length > 100
                ? description.substring(0, 100) + ".."
                : description}{" "}
              <Link
                to={`/governance/disputes/${roundId}/${entryId}`}
                className="text-blue"
              >
                Read more.
              </Link>
            </p>
          </div>
          <div className="col-sm-3">
            {resolved === 0 && (
              <>
                <Link
                  to={`/governance/disputes/${roundId}/${entryId}`}
                  style={{ textDecoration: "none" }}
                >
                  <button className="btn btn-outline-success btn-block">
                    Vote for Dispute
                  </button>
                </Link>
                <p className="mb-0 mt-1 text-center text-secondary">
                  {votesYes} votes in support.
                </p>
              </>
            )}
            {resolved !== 0 &&
              (resolved === 1 ? (
                <>
                  <button disabled className="btn btn-danger btn-block">
                    Entry Disqualified
                  </button>
                  <p className="mb-0 mt-1 text-center text-secondary">
                    {votesYes} votes in support.
                  </p>
                </>
              ) : (
                <>
                  <button disabled className="btn btn-success btn-block">
                    Dispute Rejected
                  </button>
                  <p className="mb-0 mt-1 text-center text-secondary">
                    {votesNo} votes against.
                  </p>
                </>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveDispute;
