import React from "react";
import { Link } from "react-router-dom";

const ProjectCard = ({ details }) => {
  return (
    <div className="col-4 mb-4">
      <div className="card">
        <img
          className="card-img-top"
          src={details.image}
          alt="Project Background"
        />
        <div className="card-body">
          <h5 className="card-title">{details.title}</h5>
          <p className="card-text">{details.description}</p>
          <Link to={`/contribute/${details.id}`}>
            <button className="btn btn-primary btn-block">Contribute</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
