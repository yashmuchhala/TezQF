import React from "react";

import ProjectCard from "../components/shared/ProjectCard";

const dummyProjects = [
  {
    id: 1,
    image:
      "https://image.freepik.com/free-photo/abstract-connected-dots-lines-blue-background_34629-424.jpg",
    title: "Title 1",
    description:
      "A short description of the project limited to a number of characters.",
  },
  {
    id: 2,
    image:
      "https://image.freepik.com/free-photo/abstract-connected-dots-lines-blue-background_34629-424.jpg",
    title: "Title 2",
    description: "Desc 2",
  },
  {
    id: 3,
    image:
      "https://image.freepik.com/free-photo/abstract-connected-dots-lines-blue-background_34629-424.jpg",
    title: "Title 3",
    description: "Desc 3",
  },
  {
    id: 4,
    image:
      "https://image.freepik.com/free-photo/abstract-connected-dots-lines-blue-background_34629-424.jpg",
    title: "Title 4",
    description: "Desc 4",
  },
];

const Contribute = () => {
  const renderProjects = dummyProjects.map((details) => (
    <ProjectCard details={details} />
  ));

  return (
    <div>
      {/* Header */}
      <h1 className="font-weight-light">Funding Round 5</h1>
      <h4 className="font-weight-lighter">
        The community has contributed over $14000 till now! Help your favourite
        projects in getting ahead!
      </h4>
      <h5 className="font-weight-lighter">
        <em>Ends in 25D 12H 20M</em>
      </h5>

      <hr />

      {/* Body - Divided into 2 columns*/}
      {/* Column 1 for filtering, Column 2 for displaying projects */}
      <div className="row">
        {/* Filters column */}
        <div className="col-3">
          <h5>Filter Projects</h5>
          <div>Defi</div>
          <div>Tech</div>
          <div>Community</div>
        </div>

        {/* Projects column */}
        <div className="col">
          {/* Search input with button */}
          <div className="input-group">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search"
                aria-label="Search"
              />
              <div className="input-group-append">
                <button
                  className="btn btn-success"
                  type="button"
                  id="button-addon2"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="container-fluid">
            <div className="row">{renderProjects}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contribute;
