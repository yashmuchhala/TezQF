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
      <div className="text-center text-primary">
        <div className="spinner-border" />
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
          <button disabled className="btn btn-success btn-block">
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
            className="btn btn-outline-success btn-block"
          >
            {loading && <div className="spinner-border spinner-border-sm" />}
            {loading ? " Processing Transaction" : "List Round"}
          </button>
          <p className="mt-1 text-center text-black">
            {proposal.totalFunds.toNumber() / 1000000} tz in sponsorship till
            now.
          </p>
        </>
      );
    } else {
      return (
        <>
          <button disabled className="btn btn-danger btn-block">
            Rejected
          </button>
          <p className="mt-1 text-center text-secondary">
            {proposal.votesNo.toNumber()} votes against.
          </p>
        </>
      );
    }
  };

  return (
    <div className="row">
      {/* Proposal Details */}
      <div className="col-md-8">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title">
              Proposal to conduct funding round {proposal.id.toNumber()}
            </h2>
            <h4>Description</h4>
            <p className="text-grey">{ipfsContent.description}</p>
            <table>
              <thead>
                <tr>
                  <td>
                    <h4>Start</h4>
                  </td>
                  <td className="px-4">
                    <h4>End</h4>
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
            <br />
            <h4>Categories</h4>
            <p>{ipfsContent.categories.join(", ")}</p>
            <br />
          </div>
        </div>
      </div>

      {/* Voting details */}
      <div className="pt-2 col-md-4">
        {getVotingButton()}
        <div className="card">
          <div className="card-body">
            <h4>Details</h4>
            <table className="w-100 mb-3 details-table">
              <tbody>
                <tr>
                  <td className="text-grey">Creator</td>
                  <td>
                    <a
                      href={`https://carthagenet.tzstats.com/${proposal.creator}`}
                    >
                      {proposal.creator.slice(0, 7)}...
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="text-grey">Created at</td>
                  <td>
                    <Moment format="DD/MM/YYYY">{proposal.created}</Moment>
                  </td>
                </tr>
                {proposal.resolved.toNumber() === 0 ? (
                  <tr>
                    <td className="text-grey">Ends in</td>
                    <td>
                      <Moment format="DD/MM/YYYY">{proposal.expiry}</Moment>
                    </td>
                  </tr>
                ) : (
                  <></>
                )}
              </tbody>
            </table>

            <h4>Voting Stats</h4>
            <table className="w-100 mb-3 details-table">
              <tbody>
                <tr>
                  <td className="text-grey">Unique Voters</td>
                  <td>{proposal.voters.size}</td>
                </tr>
                <tr>
                  <td className="text-grey">Yes Votes</td>
                  <td>{proposal.votesYes.toNumber()}</td>
                </tr>
                <tr>
                  <td className="text-grey">No Votes</td>
                  <td>{proposal.votesNo.toNumber()}</td>
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
