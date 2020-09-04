import React, { useState } from "react";

import { proposalVaidations as validations } from "../../utils/validations";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const RoundProposal = () => {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [categories, setCategories] = useState("");
  const [description, setDescription] = useState("");
  const [datesError, setDatesError] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!start || !end || start < new Date() || end <= start) {
      setDatesError(true);
      return;
    } else setDatesError(false);
    if (!categories) {
      setCategoriesError(true);
      return;
    } else setCategoriesError(false);
    if (!validations.description(description)) {
      setDescriptionError(true);
      return;
    } else setDescriptionError(false);

    setDatesError(false);
    setCategoriesError(false);
    setDescriptionError(false);

    const ipfsObject = {
      description,
      categories: categories.split(","),
    };

    const cid = await ipfs.add(JSON.stringify(ipfsObject));
    console.log(cid);
  };

  return (
    <div className="container w-75 mb-5">
      <h1>Setup New Funding Round Proposal</h1>
      <p className="lead">
        You are about to setup a new funding round proposal. You must be a
        holder of at least 2000 DAO tokens, in order to confirm this
        transaction.
      </p>
      <br />
      <form onSubmit={handleSubmit}>
        <div className="row no-gutters">
          <div className="col mr-2">
            <label className="font-weight-bold mb-0">
              Start Date<sup className="text-danger">*</sup>
            </label>
            <input
              type="date"
              className={`form-control ${
                datesError ? "border-danger mb-0" : "mb-3"
              }`}
              placeholder="Start Date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            {datesError ? (
              <div className={`text-danger mb-3`}>Please enter valid dates</div>
            ) : null}
          </div>
          <div className="col ml-2">
            <label className="font-weight-bold mb-0">
              End Date<sup className="text-danger">*</sup>
            </label>
            <input
              type="date"
              className={`form-control ${
                datesError ? "border-danger mb-0" : "mb-3"
              }`}
              placeholder="End Date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <label className="font-weight-bold mb-0">
          Entry Categories<sup className="text-danger">*</sup>
        </label>
        <input
          type="text"
          className={`form-control ${
            categoriesError ? "border-danger mb-0" : "mb-3"
          }`}
          placeholder="Enter comma separated categories"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
        />
        {categoriesError ? (
          <div className={`text-danger mb-3`}>
            Please enter at least one category
          </div>
        ) : null}

        <label className="font-weight-bold mb-0">
          Description<sup className="text-danger">*</sup>
        </label>
        <textarea
          type="text"
          className={`form-control ${
            descriptionError ? "border-danger mb-0" : "mb-3"
          }`}
          placeholder="Enter a short description for the proposed funding round..."
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {descriptionError ? (
          <div className={`text-danger mb-3`}>
            Please enter 1-500 characters
          </div>
        ) : null}

        <button className="btn btn-lg btn-outline-primary font-weight-bold">
          Confirm Proposal
        </button>
      </form>
    </div>
  );
};

export default RoundProposal;
