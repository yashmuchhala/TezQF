import React, { useState } from "react";
import { useSelector } from "react-redux";

const ProjectEntry = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [category, setCategory] = useState("");
  const [termsAndConditionsCheckBox, setTermsAndConditionsCheckBox] = useState(
    false
  );
  const roundManagerContract = useSelector(
    (state) => state.contract.contracts.roundManager
  );

  const onSubmit = async () => {
    setIsCompleted(false);
    setIsLoading(true);
    const success = await roundManagerContract.enterRound(description);
    if (success) {
      setIsCompleted(true);
    }
    setIsLoading(false);
  };
  return (
    <div className="container d-flex align-items-center flex-column mb-5">
      {/* Header */}
      <h1 className="font-weight-light">Enter Round 5:</h1>
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
            className="form-control w-100 mb-3"
            placeholder="Add a link to your project's image"
            aria-label="Project Image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <label className="font-weight-bold mb-0">Project Title</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Title"
            aria-label="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="font-weight-bold mb-0">Project Description</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Description"
            aria-label="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="font-weight-bold mb-0">Website</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Website"
            aria-label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <div className="row w-100 no-gutters">
            <div className="col mr-2">
              <label className="font-weight-bold mb-0">Twitter Handle</label>
              <input
                type="text"
                className="form-control w-100 mb-3"
                placeholder="Twitter"
                aria-label="Twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
            </div>
            <div className="col ml-2">
              <label className="font-weight-bold mb-0">Github Repo</label>
              <input
                type="text"
                className="form-control w-100 mb-3"
                placeholder="Github"
                aria-label="Github"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>
          </div>

          <label className="font-weight-bold mb-0">Category</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Category"
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <div className="form-check form-check-inline mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              value={termsAndConditionsCheckBox === true ? true : false}
              onChange={(e) => {
                setTermsAndConditionsCheckBox(!termsAndConditionsCheckBox);
              }}
            />
            <label className="form-check-label font-weight-bold">
              <em>I have read and accept all the terms and conditions.</em>
            </label>
          </div>
          {isLoading ? (
            "Loading"
          ) : (
            <>
              <button
                className="btn btn-primary btn-block font-weight-bold"
                onClick={onSubmit}
              >
                CONFIRM ENTRY
              </button>
              <h1>{isCompleted ? "Success!" : ""}</h1>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEntry;
