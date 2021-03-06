import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const ProjectProfile = () => {
  const roundManagerContract = useSelector(
    (state) => state.contract.contracts.roundManager
  );
  const { rounds } = useSelector((state) => state.round);
  const account = useSelector((state) => state.credentials.wallet.account);

  const round = rounds ? rounds[rounds.length - 1] : null;

  const [isLoading, setIsLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [amount, setAmount] = useState();

  const { id } = useParams();
  const project = round?.entries?.get(id);

  if (project) console.log(project.contributions.get(account));

  const [projectDescription, setProjectDescription] = useState();

  useEffect(() => {
    if (project?.description) {
      const fetchDescription = async () => {
        const description = await ipfs.cat(project.description);
        setProjectDescription(JSON.parse(description));
        setProjectLoading(false);
      };
      fetchDescription();
    }
  }, [project]);

  // State to maintain active tab
  const [activeTab, setActiveTab] = useState(0);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await roundManagerContract.contribute(id, amount * 1000000);
      window.location.reload();
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      await roundManagerContract.withdrawContribution(rounds.length, id);
      window.location.reload();
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContributors = () => {
    const contributors = [];
    if (project) {
      project.contributions.forEach((contributor, key) => {
        contributors.push(
          <li className="list-group-item row d-flex" key={key}>
            <span className="col-8">{key}</span>
            <span className="col-2">
              {(contributor.amount || 0) / 1000000}tz
            </span>
            <span className="col-2">
              ${(2.6 * contributor.amount) / 1000000}
            </span>
          </li>
        );
      });
    }
    return contributors;
  };

  return projectLoading ? (
    <div className="text-center py-5">
      <div className="spinner-grow spinner-grow-sm text-success"></div>
      <div className="spinner-grow spinner-grow-sm text-success ml-2 mr-2"></div>
      <div className="spinner-grow spinner-grow-sm text-success "></div>
    </div>
  ) : (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-5">
        {/* Project Image */}
        <div className="col-4">
          <img
            src={projectDescription?.image}
            height="100%"
            width="100%"
            alt="Project Background"
          />
        </div>
        {/* Project Overview */}
        <div className="col-4">
          <h1 className="font-weight-light">{projectDescription?.title}</h1>

          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <a href={projectDescription?.website} className="profile-link">
                <i className="fa fa-link" /> {projectDescription?.website}
              </a>
            </li>
            <li className="list-group-item">
              <a href={projectDescription?.github} className="profile-link">
                <i className="fa fa-github" /> {projectDescription?.github}
              </a>
            </li>
            <li className="list-group-item">
              <a href={projectDescription?.twitter} className="profile-link">
                <i className="fa fa-twitter" /> {projectDescription?.twitter}
              </a>
            </li>
            <li className="list-group-item">
              <a
                href={`https://carthagenet.tzstats.com/${project?.address}`}
                className="profile-link"
              >
                <i className="fa fa-address-book-o" />{" "}
                {project?.address.slice(0, -5)}...
              </a>
            </li>
          </ul>
        </div>
        {/* Project funding */}
        <div className="col-4 d-flex flex-column align-items-center justify-content-center">
          {project?.disqualified ? (
            <>
              <h1 className="text-danger">*DISQUALIFIED*</h1>
              {project.contributions.has(account) ? (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleWithdraw}
                >
                  {isLoading && (
                    <div className="spinner-border spinner-border-sm" />
                  )}
                  {isLoading
                    ? " Processing Transaction"
                    : "Withdraw Contribution"}
                </button>
              ) : null}
            </>
          ) : (
            <>
              <h1 className="font-weight-light">
                {(project?.totalContribution || 0) / 1000000} tz
              </h1>
              <p>
                Received from a total of {project?.contributions.size || "0"}{" "}
                contributor(s)
              </p>
              <input
                type="text"
                className="form-control w-100 mb-3"
                placeholder="Enter amount in tez"
                aria-label="Amount"
                name="amount"
                value={amount}
                onChange={({ target: { value } }) => setAmount(value)}
              />
              {project.contributions.has(account) ? (
                <button disabled className="btn btn-outline-primary btn-block">
                  You have already contributed
                </button>
              ) : project.address === account ? (
                <button disabled className="btn btn-outline-primary btn-block">
                  Cannot contribute to your own project!
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleSubmit}
                >
                  {isLoading ? "Processing Transaction " : "Contribute"}
                  {isLoading && (
                    <div className="spinner-grow spinner-grow-sm" />
                  )}
                </button>
              )}
              {/* <p className="mt-1 align-self-end">
                <i className="fa fa-exclamation-triangle" /> Dispute
              </p> */}
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
        {/* <li className="nav-item">
          <a
            href="#comments"
            className={`nav-link ${activeTab === 2 ? `active` : null}`}
            onClick={() => setActiveTab(2)}
          >
            Comments
          </a>
        </li> */}
      </ul>

      {/* Tab content */}
      <div className="tab-content container mt-3">
        {/* Description Tab */}
        <div
          className={`tab-pane ${activeTab === 0 ? `active` : null}`}
          id="description"
        >
          {projectDescription?.description}
        </div>

        {/* Contributors Tab */}
        <div
          className={`tab-pane ${activeTab === 1 ? `active` : null}`}
          id="description"
        >
          {/* {project?.disqualified ? (
            <>
              <h2 className="font-weight-light text-center">
                This project was disqualified for PLAGIARISM.
              </h2>
              <h2 className="font-weight-light text-center">
                View the dispute statement here.
              </h2>
            </>
          ) : ( */}
          <>
            <p className="text-center text-success font-weight-bold">
              {project?.contributions.size} Contributor(s)
            </p>
            <ul className="list-group list-group-flush">
              {renderContributors()}
            </ul>
          </>
          {/* )} */}
        </div>

        {/* Comments Tab */}
        {/* <div
          className={`tab-pane ${activeTab === 2 ? `active` : null}`}
          id="description"
        >
          Comments
        </div> */}
      </div>
    </div>
  );
};

export default ProjectProfile;
