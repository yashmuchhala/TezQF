import React from "react";
import Moment from "react-moment";
import { Link } from "react-router-dom";

const ArchivedProposal = ({ id, resolved, start, end, votesYes, votesNo }) => {
  return (
    <div className="mb-3 card">
      <div className="card-body p-5">
        <div className="align-items-center row">
          <div className="col-sm-9">
            <h5
              className="card-title text-secondary"
              style={{ fontSize: "32px" }}
            >{`Proposal to conduct funding round ${id}`}</h5>
            <p className="card-text">
              {`Round ${id} to be held from `}
              <Moment format="DD-MM-YYYY">{start}</Moment> {" to "}
              <Moment format="DD-MM-YYYY">{end}</Moment>
              {". "}
              <Link to={`/governance/executive/${id}`} className="text-blue">
                Read more.
              </Link>
            </p>
          </div>

          <div className="col-sm-3">
            {resolved === 1 ? (
              <>
                <button disabled className="btn btn-success btn-block p-3">
                  Accepted
                </button>
                <p className="mb-0 mt-1 text-center text-secondary">
                  {votesYes} votes in support.
                </p>
              </>
            ) : (
              <>
                <button disabled className="btn btn-danger btn-block">
                  Rejected
                </button>
                <p className="mb-0 mt-1 text-center text-secondary">
                  {votesNo} votes against.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivedProposal;
