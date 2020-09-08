import React, { useState } from "react";

import { disputeValidations as validations } from "../../utils/validations";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const DisputeProposal = () => {
  const [entry, setEntry] = useState(0);
  const [link, setLink] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [entryError, setEntryError] = useState(false);
  const [reasonError, setReasonError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (entry === 0) {
      setEntryError(true);
      return;
    } else setEntryError(false);
    if (!validations.reason(reason)) {
      setReasonError(true);
      return;
    } else setReasonError(false);
    if (!validations.description(description)) {
      setDescriptionError(true);
      return;
    } else setDescriptionError(false);

    setEntryError(false);
    setReasonError(false);
    setDescriptionError(false);

    const ipfsObject = {
      reason,
      links: link.split(","),
      description,
    };

    const cid = await ipfs.add(JSON.stringify(ipfsObject));
    console.log(cid);
    console.log(await ipfs.cat(cid));
  };

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
      <form onSubmit={handleSubmit}>
        {/* Replace with map on contract integration */}
        <label className="font-weight-bold mb-0">
          Select Entry<sup className="text-danger">*</sup>
        </label>
        <select
          onChange={(e) => setEntry(e.target.value)}
          value={entry}
          className={`custom-select ${
            entryError ? "border-danger mb-0" : "mb-3"
          }`}
        >
          <option disabled value={0}>
            Select an entry to dispute
          </option>
          <option value={1}>Entry 1: MakerDAO</option>
          <option value={2}>Entry 2: Uniswap</option>
          <option value={3}>Entry 3: Tether</option>
        </select>
        {entryError ? (
          <div className={`text-danger mb-3`}>Please select a valid entry</div>
        ) : null}

        <label className="font-weight-bold mb-0">
          Dispute Reason<sup className="text-danger">*</sup>
        </label>
        <input
          type="text"
          className={`form-control ${
            reasonError ? "border-danger mb-0" : "mb-3"
          }`}
          placeholder="Reason for dispute"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {reasonError ? (
          <div className={`text-danger mb-3`}>Please enter 1-50 characters</div>
        ) : null}

        <label className="font-weight-bold mb-0">Relevant Links</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Relevant links supporting the dispute"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

        <label className="font-weight-bold mb-0">
          Description<sup className="text-danger">*</sup>
        </label>
        <textarea
          type="text"
          className={`form-control ${
            descriptionError ? "border-danger mb-0" : "mb-3"
          }`}
          placeholder="Enter a short description for the proposed dispute..."
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {descriptionError ? (
          <div className={`text-danger mb-3`}>
            Please enter 1-500 characters
          </div>
        ) : null}

        <button className="btn btn-lg btn-outline-danger font-weight-bold">
          Stake & Confirm
        </button>
      </form>
    </div>
  );
};

export default DisputeProposal;
