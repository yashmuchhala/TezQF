import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import moment from "moment";

import ProjectCard from "../../../components/rounds/ProjectCard";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [filter, setFilter] = useState("");

  const { rounds, currentRound } = useSelector((state) => state.round);
  const round = rounds ? rounds[rounds.length - 1] : null;

  useEffect(() => {
    const fetchProjects = async () => {
      let ipfsDescriptions = [];

      round.entries.forEach((project) => {
        ipfsDescriptions.push(ipfs.cat(project.description));
      });

      ipfsDescriptions = await Promise.all(ipfsDescriptions);

      let tempProjects = [];

      ipfsDescriptions.forEach((description, key) => {
        tempProjects.push({ ...JSON.parse(description), id: key + 1 });
      });
      setProjects(tempProjects);
      setLoading(false);
    };
    if (round) {
      fetchProjects();
    } else {
      setLoading(true);
    }
  }, [round]);

  const fetchDiff = () => {
    const now = moment(new Date());
    const end = moment(round.end);
    var diff = moment.duration(moment(end).diff(moment(now)));

    var days = parseInt(diff.asDays());
    var hours = parseInt(diff.asHours());
    hours = hours - days * 24;
    var minutes = parseInt(diff.asMinutes());
    minutes = minutes - (days * 24 * 60 + hours * 60);

    return days > 0 ? `${days} D ${hours} H` : `${hours} H ${minutes} M`;
  };

  const renderProjects = projects.map((details, index) => {
    return <ProjectCard details={details} key={index} />;
  });

  if (!currentRound) {
    return (
      <div className="text-center text-primary" style={{ padding: "256px" }}>
        <div className="spinner-grow spinner-grow-sm text-info" />
        <div className="spinner-grow spinner-grow-sm text-info ml-2 mr-2" />
        <div className="spinner-grow spinner-grow-sm text-info" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h1 className="font-weight-light">
        Funding Round {currentRound.toNumber()}
      </h1>
      <h4 className="font-weight-lighter">
        The community has contributed over $14000 till now! Help your favourite
        projects in getting ahead!
      </h4>
      <h5 className="font-weight-lighter">
        <em>Ends in {fetchDiff()}</em>
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
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-grow spinner-grow-sm text-success"></div>
                <div className="spinner-grow spinner-grow-sm text-success ml-2 mr-2"></div>
                <div className="spinner-grow spinner-grow-sm text-success "></div>
              </div>
            ) : projects.length !== 0 ? (
              <div className="row">{renderProjects}</div>
            ) : (
              <p className="text-center">No Projects to Show</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
