import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

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
  const [loading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const history = useHistory();

  const { rounds, isRoundActive } = useSelector((state) => state.round);
  const daoContract = useSelector((state) => state.contract.contracts.dao);

  const round = rounds ? rounds[rounds.length - 1] : null;

  useEffect(() => {
    const fetchProjects = async () => {
      let ipfsDescriptions = [];
      let entryIds = [];

      round.entries.forEach((project, id) => {
        if (!project.disputed) {
          ipfsDescriptions.push(ipfs.cat(project.description));
          entryIds.push(id);
        }
      });

      ipfsDescriptions = await Promise.all(ipfsDescriptions);

      let tempProjects = [];

      ipfsDescriptions.forEach((description, key) => {
        const project = JSON.parse(description);
        tempProjects.push({ title: project.title, id: entryIds[key] });
      });
      setProjects(tempProjects);
      setPageLoading(false);
    };

    if (round) {
      fetchProjects();
    }
  }, [round]);

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
    try {
      setIsLoading(true);
      await daoContract.raiseDispute(entry, cid);
      history.push("/governance/disputes");
    } catch (err) {
      console.log(err);
      alert(err);
    }
    setIsLoading(false);
  };

  if (pageLoading) {
    return (
      <div className="text-center text-primary" style={{ padding: "256px" }}>
        <div className="spinner-grow spinner-grow-sm text-info" />
        <div className="spinner-grow spinner-grow-sm text-info ml-2 mr-2" />
        <div className="spinner-grow spinner-grow-sm text-info" />
      </div>
    );
  } else if (!isRoundActive) {
    return (
      <div className="text-center" style={{ padding: "256px" }}>
        <h1 className="font-weight-light">There is no active funding round.</h1>
      </div>
    );
  }

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
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              Entry {project.id}: {project.title}
            </option>
          ))}
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
          {loading && <div className="spinner-border" />}
          {loading ? " PROCESSING TRANSACTION" : "STAKE & CONFIRM"}
        </button>
      </form>
    </div>
  );
};

export default DisputeProposal;
