import React from "react";

const Sponsor = () => {
  return (
    <div className="container d-flex align-items-center flex-column mb-5">
      {/* Header */}
      <h1 className="font-weight-light">Sponsor Round 5</h1>
      <h4 className="text-center font-weight-light mb-3">
        Help young projects grow by sponsoring a match funding round.
      </h4>

      {/* Form */}
      <div className="card w-75">
        <div className="card-body form-group">
          <h4 className="text-center font-weight-light mb-3">
            Funds in the pool
          </h4>
          <h2 className="text-center text-success">$21000</h2>
          <h4 className="text-center mb-3">
            donated by 12 unique contributors
          </h4>

          <label className="font-weight-bold mb-0">Name</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Name"
            aria-label="Name"
          />

          <label className="font-weight-bold mb-0">Amount</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Amount (in XTZ)"
            aria-label="Amount"
          />

          <button className="btn btn-primary btn-block font-weight-bold">
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sponsor;
