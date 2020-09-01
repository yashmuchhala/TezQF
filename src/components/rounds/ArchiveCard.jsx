import React from "react";

const ArchiveCard = ({ details }) => {
  return (
    <div className="col-4 mb-4">
      <div class="card">
        <img
          class="card-img-top"
          src={details.image}
          alt="Project Background"
        />
        <div class="card-body">
          <h5 class="card-title">{details.title}</h5>
          <p class="card-text">{details.description}</p>

          {/* Show contribution and CLR match only if not disqualified */}
          {details.disqualified ? (
            <h5 className="text-danger text-center">DISQUALIFIED</h5>
          ) : (
            <div className="row">
              <div className="col">
                <h5 className="mb-0">${details.amount}</h5>
                <span style={{ fontSize: "0.8em" }}>Contributions</span>
              </div>
              <div className="col">
                <h5 className="mb-0 text-primary">${details.clr}</h5>
                <span
                  style={{ fontSize: "0.8em" }}
                  className="font-weight-bold"
                >
                  CLR Match
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveCard;
