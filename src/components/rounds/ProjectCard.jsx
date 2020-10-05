import React from "react";
import { Link } from "react-router-dom";

const ProjectCard = ({ details }) => {
  return (
    <div className="d-flex col-4 mb-4">
      <div className="card align-self-stretch">
        <img
          className="card-img-top"
          src={details.image}
          alt="Project Background"
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{details.title}</h5>
          <p className="card-text">
            {details.description.length > 80
              ? details.description.slice(0, 80) + "..."
              : details.description}
          </p>
          <Link to={`/contribute/${details.id}`} className="mt-auto">
            <button className="btn btn-primary btn-block">Contribute</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
