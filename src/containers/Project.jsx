import React from "react";
import { useParams } from "react-router-dom";

import { dummyProjects } from "../data/dummyProjects";

const Project = () => {
  const { id } = useParams();

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-4">
          <img
            src={dummyProjects[id].image}
            height="250px"
            width="300px"
            alt="Project Background"
          />
        </div>
        <div className="col-4">
          <h1 className="font-weight-light">{dummyProjects[id].title}</h1>
          <h3 className="font-weight-light">{dummyProjects[id].pitch}</h3>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">{dummyProjects[id].website}</li>
            <li class="list-group-item">{dummyProjects[id].github}</li>
            <li class="list-group-item">{dummyProjects[id].address}</li>
          </ul>
        </div>
        <div className="col-4 d-flex flex-column align-items-center justify-content-center">
          <h1 className="font-weight-light">{dummyProjects[id].amount} tz</h1>
          <p>Received from a total of 180 contributors</p>
          <button className="btn btn-primary btn-block">Contribute</button>
          <p className="align-self-end">! Dispute</p>
        </div>
      </div>

      <hr />
    </div>
  );
};

export default Project;
