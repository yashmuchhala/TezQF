import React, { useState } from "react";

import { projectEntryValidations as validations } from "../../../utils/validations";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const ProjectEntry = () => {
  const [projectDetails, setProjectDetails] = useState({
    image: "",
    title: "",
    description: "",
    website: "",
    twitter: "",
    github: "",
    category: "",
    address: "",
    tnc: false,
  });

  const [errors, setErrors] = useState({
    image: false,
    title: false,
    description: false,
    website: false,
    twitter: false,
    github: false,
    category: false,
    address: false,
    tnc: false,
  });

  const handleChange = ({ target: { name, value } }) => {
    setProjectDetails({
      ...projectDetails,
      [name]: value,
    });
    if (value)
      setErrors({
        ...errors,
        [name]: !validations[name](value),
      });
    else
      setErrors({
        ...errors,
        [name]: false,
      });
  };

  const handleSubmit = async () => {
    const submitErrors = {
      title: !validations["title"](projectDetails.title),
      description: !validations["description"](projectDetails.description),
      github: !validations["github"](projectDetails.github),
      category: !validations["category"](projectDetails.category),
      address: !validations["address"](projectDetails.category),
      tnc: !projectDetails.tnc,
      image: errors.image,
      website: errors.website,
      twitter: errors.twitter,
    };

    setErrors(submitErrors);

    for (const field in submitErrors) {
      if (submitErrors[field]) return;
    }

    const cid = await ipfs.add(JSON.stringify(projectDetails));
    console.log(cid);
  };

  return (
    <div className="container d-flex align-items-center flex-column mb-5">
      {/* Header */}
      <h1 className="font-weight-light">Enter Round 5</h1>
      <h4 className="text-center font-weight-light mb-3">
        List your project to receive community contribution and a possible chunk
        from the funding pool.
      </h4>

      {/* Form */}
      <div className="card w-75">
        <div className="card-body form-group">
          <label className="font-weight-bold mb-0">Project Image</label>
          <input
            type="text"
            className={`form-control w-100 ${
              errors.image ? "border-danger mb-0" : "mb-3"
            }`}
            placeholder="Add a link to your project's image"
            aria-label="Project Image"
            name="image"
            value={projectDetails.image}
            onChange={handleChange}
          />
          {errors.image ? (
            <div className={`text-danger mb-3`}>Please enter a valid URL</div>
          ) : null}

          <label className="font-weight-bold mb-0">
            Project Title<sup className="text-danger">*</sup>
          </label>
          <input
            type="text"
            className={`form-control w-100 ${
              errors.title ? "border-danger mb-0" : "mb-3"
            }`}
            placeholder="Title"
            aria-label="Project Title"
            name="title"
            value={projectDetails.title}
            onChange={handleChange}
          />
          {errors.title ? (
            <div className={`text-danger mb-3`}>
              Please enter 1-50 characters
            </div>
          ) : null}

          <label className="font-weight-bold mb-0">
            Project Description<sup className="text-danger">*</sup>
          </label>
          <textarea
            type="text"
            className={`form-control w-100 ${
              errors.description ? "border-danger mb-0" : "mb-3"
            }`}
            placeholder="Description"
            aria-label="Project Description"
            name="description"
            value={projectDetails.description}
            onChange={handleChange}
          />
          {errors.description ? (
            <div className={`text-danger mb-3`}>
              Please enter 1-500 characters
            </div>
          ) : null}

          <label className="font-weight-bold mb-0">Website</label>
          <input
            type="text"
            className={`form-control w-100 ${
              errors.website ? "border-danger mb-0" : "mb-3"
            }`}
            placeholder="Website"
            aria-label="Website"
            name="website"
            value={projectDetails.website}
            onChange={handleChange}
          />
          {errors.website ? (
            <div className={`text-danger mb-3`}>Please enter a valid URL</div>
          ) : null}

          <div className="row w-100 no-gutters">
            <div className="col mr-2">
              <label className="font-weight-bold mb-0">Twitter Handle</label>
              <input
                type="text"
                className={`form-control w-100 ${
                  errors.twitter ? "border-danger mb-0" : "mb-3"
                }`}
                placeholder="Twitter"
                aria-label="Twitter"
                name="twitter"
                value={projectDetails.twitter}
                onChange={handleChange}
              />
              {errors.twitter ? (
                <div className={`text-danger mb-3`}>
                  Please enter a valid URL
                </div>
              ) : null}
            </div>
            <div className="col ml-2">
              <label className="font-weight-bold mb-0">
                Github Repo<sup className="text-danger">*</sup>
              </label>
              <input
                type="text"
                className={`form-control w-100 ${
                  errors.github ? "border-danger mb-0" : "mb-3"
                }`}
                placeholder="Github"
                aria-label="Github"
                name="github"
                value={projectDetails.github}
                onChange={handleChange}
              />
              {errors.github ? (
                <div className={`text-danger mb-3`}>
                  Please enter a valid URL
                </div>
              ) : null}
            </div>
          </div>

          <label className="font-weight-bold mb-0">
            Category<sup className="text-danger">*</sup>
          </label>
          <input
            type="text"
            className={`form-control w-100 ${
              errors.category ? "border-danger mb-0" : "mb-3"
            }`}
            placeholder="Category"
            aria-label="Category"
            name="category"
            value={projectDetails.category}
            onChange={handleChange}
          />
          {errors.category ? (
            <div className={`text-danger mb-3`}>
              Maximum 50 characters allowed
            </div>
          ) : null}

          <label className="font-weight-bold mb-0">
            Address<sup className="text-danger">*</sup>
          </label>
          <input
            type="text"
            className={`form-control w-100 ${
              errors.address ? "border-danger mb-0" : "mb-3"
            }`}
            placeholder="Tezos Address to send funds"
            aria-label="Address"
            name="address"
            value={projectDetails.address}
            onChange={handleChange}
          />
          {errors.address ? (
            <div className={`text-danger mb-3`}>
              Please enter a valid Tezos Address of 36 characters
            </div>
          ) : null}

          <div
            className={`form-check form-check-inline ${
              errors.tnc ? "border-danger" : "mb-3"
            }`}
          >
            <input
              className="form-check-input"
              type="checkbox"
              name="tnc"
              onChange={() => {
                setErrors({
                  ...errors,
                  tnc: projectDetails.tnc,
                });
                setProjectDetails({
                  ...projectDetails,
                  tnc: !projectDetails.tnc,
                });
              }}
              checked={projectDetails.tnc}
            />
            <label className="form-check-label font-weight-bold">
              <em>I have read and accept all the terms and conditions.</em>
            </label>
          </div>
          {errors.tnc ? (
            <div className={`text-danger mb-3`}>
              Please accept the terms and conditions
            </div>
          ) : null}

          <button
            className="btn btn-primary btn-block font-weight-bold"
            onClick={handleSubmit}
          >
            CONFIRM ENTRY
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEntry;
