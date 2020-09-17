import React from "react";
import { Link } from "react-router-dom";

const ArchiveCard = ({ details }) => {
  console.log(details);
  return (
    <div className="col-4 mb-4">
      <div className="card">
        <img
          className="card-img-top"
          src={details.image}
          alt="Project Background"
        />
        <div className="card-body">
          <h5 className="card-title">{details.title}</h5>
          <p className="card-text">
            {details.description.length > 80
              ? details.description.slice(0, 80) + "..."
              : details.description}
          </p>

          {/* Show contribution and CLR match only if not disqualified */}
          {details.disqualified ? (
            <h5 className="text-danger text-center">DISQUALIFIED</h5>
          ) : (
            <div className="row">
              <div className="col">
                <h5 className="mb-0">
                  ${Math.floor(details.totalContribution / 1000000)}
                </h5>
                <span style={{ fontSize: "0.8em" }}>Contributions</span>
              </div>
              <div className="col">
                <h5 className="mb-0 text-primary">
                  ${Math.floor(details.sponsorshipWon / 1000000)}
                </h5>
                <span
                  style={{ fontSize: "0.8em" }}
                  className="font-weight-bold"
                >
                  CLR Match
                </span>
              </div>
            </div>
          )}
          <Link to={`/archives/${details.id}`}>
            <button className="btn btn-primary btn-block">View</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArchiveCard;
