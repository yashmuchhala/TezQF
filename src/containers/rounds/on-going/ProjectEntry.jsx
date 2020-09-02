import React from "react";

const ProjectEntry = () => {
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
            className="form-control w-100 mb-3"
            placeholder="Add a link to your project's image"
            aria-label="Project Image"
          />

          <label className="font-weight-bold mb-0">Project Title</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Title"
            aria-label="Project Title"
          />

          <label className="font-weight-bold mb-0">Project Description</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Description"
            aria-label="Project Description"
          />

          <label className="font-weight-bold mb-0">Website</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Website"
            aria-label="Website"
          />

          <div className="row w-100 no-gutters">
            <div className="col mr-2">
              <label className="font-weight-bold mb-0">Twitter Handle</label>
              <input
                type="text"
                className="form-control w-100 mb-3"
                placeholder="Twitter"
                aria-label="Twitter"
              />
            </div>
            <div className="col ml-2">
              <label className="font-weight-bold mb-0">Github Repo</label>
              <input
                type="text"
                className="form-control w-100 mb-3"
                placeholder="Github"
                aria-label="Github"
              />
            </div>
          </div>

          <label className="font-weight-bold mb-0">Category</label>
          <input
            type="text"
            className="form-control w-100 mb-3"
            placeholder="Category"
            aria-label="Category"
          />

          <div class="form-check form-check-inline mb-3">
            <input class="form-check-input" type="checkbox" />
            <label class="form-check-label font-weight-bold">
              <em>I have read and accept all the terms and conditions.</em>
            </label>
          </div>

          <button className="btn btn-primary btn-block font-weight-bold">
            CONFIRM ENTRY
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEntry;
