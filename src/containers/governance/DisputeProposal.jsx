import React, { useState } from "react";

const DisputeProposal = () => {
  const [entry, setEntry] = useState(0);
  const [link, setLink] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="container w-75 mb-5">
      <h1>Dispute an Entry</h1>
      <p className="lead">
        You are about to dispute an entry in an on-going funding round. You have
        to stake a total of 500 tokens in order to confirm the transaction. If
        the entry is thereby proved to be fair by the community, you shall lose
        your stake, otherwise the tokens shall be returned.
      </p>
      <br />
      <form>
        {/* Replace with map on contract integration */}
        <label className="font-weight-bold mb-0">Select Entry</label>
        <select
          onChange={(e) => setEntry(e.target.value)}
          value={entry}
          className="custom-select mb-3"
        >
          <option disabled value={0}>
            Select an entry to dispute
          </option>
          <option value={1}>Entry 1: MakerDAO</option>
          <option value={2}>Entry 2: Uniswap</option>
          <option value={3}>Entry 3: Tether</option>
        </select>

        <label className="font-weight-bold mb-0">Dispute Reason</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Reason for dispute"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <label className="font-weight-bold mb-0">Relevant Links</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Relevant links supporting the dispute"
          value={link}
          onChange={(e) => setLink(e.target.value)}
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

        <button className="btn btn-lg btn-outline-danger font-weight-bold">
          Stake & Confirm
        </button>
      </form>
    </div>
  );
};

export default DisputeProposal;
