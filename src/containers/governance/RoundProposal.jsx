import React, { useState } from "react";

const RoundProposal = () => {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [categories, setCategories] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="container w-75 mb-5">
      <h1>Setup New Funding Round Proposal</h1>
      <p className="lead">
        You are about to setup a new funding round proposal. You must be a
        holder of at least 2000 DAO tokens, in order to confirm this
        transaction.
      </p>
      <br />
      <form>
        <div className="row no-gutters">
          <div className="col mr-2">
            <label className="font-weight-bold mb-0">Start Date</label>
            <input
              type="date"
              className="form-control mb-3"
              placeholder="Start Date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="col ml-2">
            <label className="font-weight-bold mb-0">End Date</label>
            <input
              type="date"
              className="form-control mb-3"
              placeholder="End Date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <label className="font-weight-bold mb-0">Entry Categories</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Categories"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
        />

        <label className="font-weight-bold mb-0">Description</label>
        <textarea
          type="text"
          className="form-control mb-3"
          placeholder="Enter a short description for the proposed funding round..."
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="btn btn-lg btn-outline-primary font-weight-bold">
          Confirm Proposal
        </button>
      </form>
    </div>
  );
};

export default RoundProposal;
