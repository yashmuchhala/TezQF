import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { dummyProjects } from "../../../data/dummyProjects";

const ProjectProfile = () => {
  const roundManagerContract = useSelector(
    (state) => state.contract.contracts.roundManager
  );
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState();
  const { id } = useParams();
  // State to maintain active tab
  const [activeTab, setActiveTab] = useState(0);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await roundManagerContract.contribute(id, amount);
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContributors = dummyProjects[id - 1].contributors?.map(
    (contribution) => (
      <li className="list-group-item row d-flex" key={contribution.address}>
        <span className="col-8">{contribution.address}</span>
        <span className="col-2">{contribution.amount}</span>
        <span className="col-2">$60</span>
      </li>
    )
  );

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-5">
        {/* Project Image */}
        <div className="col-4">
          <img
            src={dummyProjects[id - 1].image}
            height="100%"
            width="100%"
            alt="Project Background"
          />
        </div>
        {/* Project Overview */}
        <div className="col-4">
          <h1 className="font-weight-light">{dummyProjects[id - 1].title}</h1>
          <h3 className="font-weight-light">{dummyProjects[id - 1].pitch}</h3>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">{dummyProjects[id - 1].website}</li>
            <li className="list-group-item">{dummyProjects[id - 1].github}</li>
            <li className="list-group-item">{dummyProjects[id - 1].address}</li>
          </ul>
        </div>
        {/* Project funding */}
        <div className="col-4 d-flex flex-column align-items-center justify-content-center">
          {dummyProjects[id - 1].disqualified ? (
            <h1 className="text-danger">*DISQUALIFIED*</h1>
          ) : (
            <>
              <h1 className="font-weight-light">
                {dummyProjects[id - 1].amount} tz
              </h1>
              <p>Received from a total of 180 contributors</p>
              <input
                type="text"
                className="form-control w-100 mb-3"
                placeholder="Enter amount in mutez"
                aria-label="Amount"
                name="amount"
                value={amount}
                onChange={({ target: { value } }) => setAmount(value)}
              />
              <button
                className="btn btn-primary btn-block"
                onClick={handleSubmit}
              >
                {isLoading && (
                  <div className="spinner-border spinner-border-sm" />
                )}
                {isLoading ? " Processing Transaction" : "Contribute"}
              </button>
              <p className="align-self-end">! Dispute</p>
            </>
          )}
        </div>
      </div>

      <hr />

      {/* Tab Navigation for description, contributors and comments */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <a
            href="#description"
            className={`nav-link ${activeTab === 0 ? `active` : null}`}
            onClick={() => setActiveTab(0)}
          >
            Description
          </a>
        </li>
        <li className="nav-item">
          <a
            href="#contributors"
            className={`nav-link ${activeTab === 1 ? `active` : null}`}
            onClick={() => setActiveTab(1)}
          >
            Contributors
          </a>
        </li>
        <li className="nav-item">
          <a
            href="#comments"
            className={`nav-link ${activeTab === 2 ? `active` : null}`}
            onClick={() => setActiveTab(2)}
          >
            Comments
          </a>
        </li>
      </ul>

      {/* Tab content */}
      <div className="tab-content container mt-3">
        {/* Description Tab */}
        <div
          className={`tab-pane ${activeTab === 0 ? `active` : null}`}
          id="description"
        >
          {dummyProjects[id - 1].description}
        </div>

        {/* Contributors Tab */}
        <div
          className={`tab-pane ${activeTab === 1 ? `active` : null}`}
          id="description"
        >
          {dummyProjects[id - 1].disqualified ? (
            <>
              <h2 className="font-weight-light text-center">
                This project was disqualified for PLAGIARISM.
              </h2>
              <h2 className="font-weight-light text-center">
                View the dispute statement here.
              </h2>
            </>
          ) : (
            <>
              <p className="text-center text-success font-weight-bold">
                {dummyProjects[id - 1].contributors.length} Contributors
              </p>
              <ul className="list-group list-group-flush">
                {renderContributors}
              </ul>
            </>
          )}
        </div>

        {/* Comments Tab */}
        <div
          className={`tab-pane ${activeTab === 2 ? `active` : null}`}
          id="description"
        >
          Comments
        </div>
      </div>
    </div>
  );
};

export default ProjectProfile;
