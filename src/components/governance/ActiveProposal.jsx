import React from "react";
import { Link } from "react-router-dom";
import Moment from "react-moment";

const ActiveProposal = ({ name, start, end, votesYes }) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="align-items-center row">
          <div className="col-sm-9">
            <h5 className="card-title">{`Proposal to conduct funding round ${name}`}</h5>
            <p className="card-text">
              {`Round ${name} to be held from `}
              <Moment format="DD-MM-YYYY">{start}</Moment> {" to "}
              <Moment format="DD-MM-YYYY">{end}</Moment>
              {". "}
              <Link to={`/governance/executive/${name}`} className="text-blue">
                Read more.
              </Link>
            </p>
          </div>
          <div className="col-sm-3">
            <Link
              to={`/governance/executive/${name}`}
              style={{ textDecoration: "none" }}
            >
              <button className="btn btn-outline-success btn-block">
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
