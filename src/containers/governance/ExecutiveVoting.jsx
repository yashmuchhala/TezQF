import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Moment from "react-moment";
import ExecutiveVotingModal from "../../components/governance/ExecutiveVotingModal";

import { useSelector } from "react-redux";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const ExecutiveVoting = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [ipfsContent, setIpfsContent] = useState({});

  const account = useSelector((state) => state.credentials.wallet.account);
  const daoContract = useSelector((state) => state.contract.contracts.dao);
  const proposal = useSelector(
    (state) => state.governance.newRoundProposals[id - 1]
  );

  useEffect(() => {
    const getContent = async () => {
      setIpfsContent(JSON.parse(await ipfs.cat(proposal.description)));
    };

    if (proposal) getContent();
  }, [proposal]);

  if (!proposal || Object.keys(ipfsContent).length === 0) {
    return (
      <div className="text-center text-primary" style={{ padding: "256px" }}>
        <div className="spinner-grow spinner-grow-sm text-info" />
        <div className="spinner-grow spinner-grow-sm text-info ml-2 mr-2" />
        <div className="spinner-grow spinner-grow-sm text-info" />
      </div>
    );
  }

  const onExecute = async () => {
    try {
      setLoading(true);
      await daoContract.executeNewRoundProposal();
      window.location.reload();
    } catch (err) {
      console.log(err);
      alert(err);
    }

    setLoading(false);
  };

  const onList = async () => {
    try {
      setLoading(true);
      await daoContract.listNewRound();
      window.location.reload();
    } catch (err) {
      console.log(err);
      alert(err);
    }

    setLoading(false);
  };

  //Check for resolved status and generate the relevant button
  const getVotingButton = () => {
    if (proposal.resolved.toNumber() === 0) {
      return Date.now() > new Date(proposal.expiry) ? (
        <>
          <button
            onClick={onExecute}
            className="btn btn-outline-primary btn-block"
          >
            {loading && <div className="spinner-border spinner-border-sm" />}
            {loading ? " Processing Transaction" : "Execute Proposal"}
          </button>
          <p className="mt-1 text-center text-secondary">
            {proposal.votesYes.toNumber()} votes in support.
          </p>
        </>
      ) : (
        <>
          <button
            data-toggle="modal"
            data-target="#executive-voting-model"
            className="btn btn-outline-success btn-block"
            disabled={proposal.voters.has(account)}
          >
            {proposal.voters.has(account) ? "You have already voted" : "Vote"}
          </button>
          <p className="mt-1 text-center text-secondary">
            {proposal.votesYes.toNumber()} votes in support.
          </p>
        </>
      );
    } else if (proposal.resolved.toNumber() === 1) {
      return proposal.listed ? (
        <>
          <button disabled className="btn btn-success btn-block p-3">
            Accepted
          </button>
          <p className="mt-1 text-center text-secondary">
            {proposal.votesYes.toNumber()} votes in support.
          </p>
        </>
      ) : (
        <>
          <button
            onClick={onList}
            className="btn btn-outline-success btn-block p-3"
          >
            {loading ? " Processing" : "List Round"}
            {loading && (
              <div className="spinner-grow spinner-grow-sm text-success ml-1" />
            )}
          </button>
          <p className="mt-1 text-center text-black">
            {proposal.totalFunds.toNumber() / 1000000} XTZ in sponsorship till
            now.
          </p>
        </>
      );
    } else {
      return (
        <>
          <button disabled className="btn btn-danger btn-block p-3">
            Rejected
          </button>
          <p className="mt-1 text-center text-secondary">
            {proposal.votesNo.toNumber()} votes against.
          </p>
        </>
      );
    }
  };
  console.log("Sponsors:", proposal.sponsorToFunds.valueMap);
  return (
    <div className="row pb-5">
      {/* Proposal Details */}
      <div className="col-md-8">
        <div className="card mt-2">
          <div className="card-body p-5">
            <h2
              className="card-title text-secondary"
              style={{ fontSize: "32px" }}
            >
              <strong>
                Proposal to conduct Funding Round {proposal.id.toNumber()}
              </strong>
            </h2>
            <hr />
            <div className="p-2">
              <h4>
                <i>Description</i>
              </h4>
              <p className="text-grey">{ipfsContent.description}</p>
            </div>
            <div className="p-2">
              <table>
                <thead>
                  <tr>
                    <td>
                      <h4>
                        <i>Start</i>
                      </h4>
                    </td>
                    <td className="pl-4">
                      <h4>
                        <i>End</i>
                      </h4>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Moment format="DD/MM/YYYY">{proposal.start}</Moment>
                    </td>
                    <td className="px-4">
                      <Moment format="DD/MM/YYYY">{proposal.end}</Moment>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-2 mt-3">
              <h4>
                <i>Categories</i>
              </h4>
              <p>
                {ipfsContent.categories.map((category) => (
                  <span
                    className="badge badge-light mt-1 mr-2 pt-2 pb-2 pl-3 pr-3 text-secondary"
                    style={{ fontSize: "16px" }}
                  >
                    {category}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Voting details */}
      <div className="pt-2 col-md-4">
        {getVotingButton()}
        <div className="card">
          <div className="card-body p-4 mb-2">
            <h3>
              <strong>Details</strong>
            </h3>
            <table className="w-100 mb-3 details-table">
              <tbody>
                <tr>
                  <td className="text-grey">
                    <i>Creator</i>
                  </td>
                  <td className="text-right">
                    <a
                      href={`https://carthagenet.tzstats.com/${proposal.creator}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {proposal.creator.slice(0, 7)}...
                      {proposal.creator.slice(32, 36)}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="text-grey">
                    <i>Created at</i>
                  </td>
                  <td className="text-right">
                    <Moment format="DD/MM/YYYY">{proposal.created}</Moment>
                  </td>
                </tr>
                {proposal.resolved.toNumber() === 0 ? (
                  <tr>
                    <td className="text-grey">
                      <i>Ends on</i>
                    </td>
                    <td className="text-right">
                      <Moment format="DD/MM/YYYY">{proposal.expiry}</Moment>
                    </td>
                  </tr>
                ) : (
                  <></>
                )}
              </tbody>
            </table>

            <h3>
              <strong>Voting Stats</strong>
            </h3>
            <table className="w-100 details-table">
              <tbody>
                <tr>
                  <td className="text-grey">
                    <i>Unique Voters</i>
                  </td>
                  <td className="text-right">{proposal.voters.size}</td>
                </tr>
                <tr>
                  <td className="text-grey">
                    <i>Yes Votes</i>
                  </td>
                  <td className="text-right">{proposal.votesYes.toNumber()}</td>
                </tr>
                <tr>
                  <td className="text-grey">
                    <i>No Votes</i>
                  </td>
                  <td className="text-right">{proposal.votesNo.toNumber()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Voting Modal */}
      <ExecutiveVotingModal id={proposal.id.toNumber()} />
    </div>
  );
};

export default ExecutiveVoting;
