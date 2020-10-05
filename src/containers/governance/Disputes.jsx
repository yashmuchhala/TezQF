import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ActiveDispute from "../../components/governance/ActiveDispute";
import ArchivedDispute from "../../components/governance/ArchivedDispute";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const Disputes = () => {
  const [activeDisputes, setActiveDisputes] = useState([]);
  const [archivedDisputes, setArchivedDisputes] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);

  const { disputes, loading } = useSelector((state) => state.governance);
  const { isRoundActive, currentRound } = useSelector((state) => state.round);

  useEffect(() => {
    const fetchActiveDisputes = async () => {
      let ipfsDescriptions = [];
      let metaDescription = [];

      const active = disputes[disputes.length - 1];

      active.forEach((dispute, key) => {
        ipfsDescriptions.push(ipfs.cat(dispute.description));
        dispute.entryId = key;
        metaDescription.push(dispute);
      });

      ipfsDescriptions = await Promise.all(ipfsDescriptions);

      let tempActiveDisputes = [];
      ipfsDescriptions.forEach((data, key) => {
        const parsedData = JSON.parse(data);
        tempActiveDisputes.push({
          mainDescription: parsedData.description,
          reason: parsedData.reason,
          links: parsedData.links,
          ...metaDescription[key],
        });
      });

      setActiveDisputes(tempActiveDisputes);
    };

    const fetchArchivedDisputes = async () => {
      const allArchivedDisputes = isRoundActive
        ? disputes.slice(0, -1)
        : disputes;
      const tempAllArchived = [];
      for (let i = 0; i < allArchivedDisputes.length; i++) {
        let ipfsDescriptions = [];
        let metaDescription = [];

        const archived = allArchivedDisputes[i];

        archived.forEach((dispute, key) => {
          ipfsDescriptions.push(ipfs.cat(dispute.description));
          dispute.entryId = key;
          metaDescription.push(dispute);
        });

        ipfsDescriptions = await Promise.all(ipfsDescriptions);

        let tempArchived = [];
        ipfsDescriptions.forEach((data, key) => {
          const parsedData = JSON.parse(data);
          tempArchived.push({
            mainDescription: parsedData.description,
            reason: parsedData.reason,
            links: parsedData.links,
            ...metaDescription[key],
          });
        });

        tempAllArchived.push(tempArchived);
      }

      setArchivedDisputes(tempAllArchived);
    };

    if (disputes.length >= 1) {
      if (isRoundActive) {
        setPageLoading(true);
        fetchActiveDisputes();
        fetchArchivedDisputes();
        setPageLoading(false);
      }
    }
  }, [disputes, isRoundActive]);

  return (
    <div>
      {/* Setup Panel */}
      <div className="card">
        <div className="card-body p-5" style={{ backgroundColor: "#FAFAFA" }}>
          <div className="align-items-center row">
            <div className="col-sm-9">
              <h5
                className="card-title text-secondary text-center"
                style={{ fontSize: "32px" }}
              >
                <strong>DISPUTE SETTLEMENTS</strong>
              </h5>
              <p className="card-text text-center pl-5 pr-5">
                Start a new dispute vote for any project that you think doesn't
                abide to the integrity of tezGrants by clicking on "Setup" and
                staking the appropriate number of tokens.
              </p>
            </div>
            <div className="col-sm-3">
              <Link
                to="/governance/disputes/new"
                style={{ textDecoration: "none" }}
              >
                <button className="btn btn-outline-primary btn-block p-3">
                  {loading || pageLoading ? (
                    <div>
                      <div className="spinner-grow spinner-grow-sm text-primary"></div>
                      <div className="spinner-grow spinner-grow-sm text-primary ml-2 mr-2"></div>
                      <div className="spinner-grow spinner-grow-sm text-primary "></div>
                    </div>
                  ) : (
                    "SETUP"
                  )}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <br />

      {/* Active Disputes */}

      {activeDisputes.length !== 0 &&
        activeDisputes.map((dispute, id) => {
          return (
            <ActiveDispute
              roundId={currentRound}
              entryId={dispute.entryId}
              index={id}
              key={id}
              reason={dispute.reason}
              disputer={dispute.disputer}
              description={dispute.mainDescription}
              votesYes={dispute.votesYes.toNumber()}
              votesNo={dispute.votesNo.toNumber()}
              resolved={dispute.resolved.toNumber()}
            />
          );
        })}

      <div className="text-center">
        <h4 className="midline-text">Archived Disputes</h4>
        <div className="midline" />
      </div>

      {/* Archived Disputes */}
      <div id="accordian">
        {archivedDisputes.length === 0 ? (
          <p className="p-5 text-center">No Archived Disputes.</p>
        ) : (
          archivedDisputes.map((disputes, index) => (
            <div key={index} className="card">
              <div className="card-header" id={`heading${index}`}>
                {/* <h1 className="mb-0"> */}
                <button
                  className="d-flex align-items-center justify-content-between btn btn-block collapsed"
                  data-toggle="collapse"
                  data-target={`#collapse${index}`}
                  aria-expanded="true"
                  aria-controls={`collapse${index}`}
                >
                  <span style={accordionHeaderStyle}>Round {index + 1}</span>
                </button>
                {/* </h1> */}
              </div>

              <div
                id={`collapse${index}`}
                className="collapse"
                aria-labelledby={`heading${index}`}
                data-parent="#accordion"
              >
                <div className="card-body m-5">
                  {disputes.size === 0 ? (
                    <p className="text-center mb-0">No disputes to show.</p>
                  ) : (
                    disputes.map((dispute, id) => {
                      return (
                        <ArchivedDispute
                          roundId={index + 1}
                          entryId={dispute.entryId}
                          index={id}
                          key={id}
                          reason={dispute.reason}
                          disputer={dispute.disputer}
                          description={dispute.mainDescription}
                          votesYes={dispute.votesYes.toNumber()}
                          votesNo={dispute.votesNo.toNumber()}
                          resolved={dispute.resolved.toNumber()}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const accordionHeaderStyle = {
  fontSize: "1.2rem",
  fontWeight: "bold",
};

export default Disputes;
