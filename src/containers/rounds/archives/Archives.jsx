import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import moment from "moment";

import ArchiveCard from "../../../components/rounds/ArchiveCard";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [categories, setCategories] = useState({});
  const [search, setSearch] = useState("");

  const { rounds, isRoundActive, currentRound } = useSelector(
    (state) => state.round
  );
  const round = rounds
    ? isRoundActive
      ? rounds[rounds.length - 2]
      : rounds[rounds.length - 1]
    : null;

  useEffect(() => {
    const fetchProjects = async () => {
      let ipfsDescriptions = [];

      round.entries.forEach((project) => {
        ipfsDescriptions.push(ipfs.cat(project.description));
      });

      ipfsDescriptions = await Promise.all(ipfsDescriptions);

      let tempProjects = [];

      ipfsDescriptions.forEach((description, key) => {
        console.log(round.entries.get((key + 1).toString()));
        // Subsidy added to show CLR (Remove later)
        // Sponsorship removed (Add later)
        const { totalContribution, subsidyPower } = round.entries.get(
          (key + 1).toString()
        );
        tempProjects.push({
          ...JSON.parse(description),
          id: key + 1,
          totalContribution,
          sponsorshipWon:
            (subsidyPower.toNumber() / round.totalSubsidyPower.toNumber()) *
            round.totalSponsorship,
        });
      });
      setProjects(tempProjects);
      setFilteredProjects(tempProjects);
      fetchCategories(tempProjects);
      setLoading(false);
    };

    const fetchCategories = async (tempProjects) => {
      let categoryMap = { All: tempProjects.length };

      tempProjects.forEach((project) => {
        if (categoryMap[project.category]) {
          categoryMap[project.category] += 1;
        } else {
          categoryMap[project.category] = 1;
        }
      });

      setCategories(categoryMap);
    };

    if (round) {
      fetchProjects();
    } else {
      setLoading(true);
    }
  }, [round]);

  const setFilter = (category) => {
    const filtered =
      category === "All"
        ? projects
        : projects.filter((project) => project.category === category);

    setFilteredProjects(filtered);
  };

  const searchProjects = () => {
    const filtered =
      search === ""
        ? projects
        : projects.filter((project) => {
            const regex = new RegExp(search, "gi");
            return regex.test(project.title) || regex.test(project.description);
          });

    setFilteredProjects(filtered);
  };

  const fetchEnd = () => {
    const end = moment(round?.end);

    return end.format("MMM Do YY");
  };

  const renderProjects = filteredProjects?.map((details) => (
    <ArchiveCard details={details} key={details.id} />
  ));

  if (!currentRound) {
    return (
      <div className="text-center text-primary" style={{ padding: "256px" }}>
        <div className="spinner-grow spinner-grow-sm text-info" />
        <div className="spinner-grow spinner-grow-sm text-info ml-2 mr-2" />
        <div className="spinner-grow spinner-grow-sm text-info" />
      </div>
    );
  }

  return rounds.length === 0 || (isRoundActive && rounds.length === 1) ? (
    <div className="text-center" style={{ padding: "256px" }}>
      <h1 className="font-weight-light">There are no Archives yet!</h1>
    </div>
  ) : (
    <div>
      {/* Header */}
      <h1 className="font-weight-light">
        Funding Round {isRoundActive ? rounds.length - 1 : rounds.length}{" "}
        Archive
      </h1>
      <h4 className="font-weight-lighter">
        The community has contributed over{" "}
        {Math.floor(round?.totalContribution / 1000000)}
        tz and a sum of {round?.totalSponsorship / 1000000}tz was distributed
        through CLR Matching!
      </h4>
      <h5 className="font-weight-lighter">
        <em>Ended on {fetchEnd()}</em>
      </h5>

      <hr />

      {/* Body - Divided into 2 columns*/}
      {/* Column 1 for filtering, Column 2 for displaying projects */}
      <div className="row">
        {/* Filters column */}
        <div className="col-3">
          <h5>Filter Projects</h5>
          {Object.keys(categories).map((category, index) => (
            <div
              className="filter-link"
              key={index}
              onClick={() => setFilter(category)}
            >
              {category} ({categories[category]})
            </div>
          ))}
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
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-success"
                  type="button"
                  id="button-addon2"
                  onClick={searchProjects}
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
            ) : filteredProjects.length !== 0 ? (
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
