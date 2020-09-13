import React from "react";
import { Link } from "react-router-dom";
import Moment from "react-moment";

const ActiveProposal = ({ id, start, end, votesYes }) => {
  return (
    <div className="card">
      <div className="card-body p-5">
        <div className="align-items-center row">
          <div className="col-sm-9">
            <h5
              className="card-title text-primary"
              style={{ fontSize: "32px", fontWeight: 600 }}
            >
              {`Proposal to conduct funding round ${id}`}
              <span
                className="badge badge-success p-2 ml-2"
                style={{ fontSize: "14px" }}
              >
                ON-GOING
              </span>
            </h5>
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
            <Link
              to={`/governance/executive/${id}`}
              style={{ textDecoration: "none" }}
            >
              <button className="btn btn-outline-success btn-block p-3">
                Vote for Proposal
              </button>
            </Link>
            <p className="mb-0 mt-1 text-center text-secondary">
              {votesYes} votes in support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveProposal;
