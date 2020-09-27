import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import Moment from "react-moment";
import DisputeVotingModal from "../../components/governance/DisputeVotingModal";

const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");

const DisputeVoting = () => {
  const { roundId, id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const account = useSelector((state) => state.credentials.wallet.account);
  const daoContract = useSelector((state) => state.contract.contracts.dao);
  const { disputes } = useSelector((state) => state.governance);

  const disputesThis = disputes ? disputes[roundId - 1] : null;
  const dispute = disputesThis ? disputesThis.get(id) : null;

  const addIpfs = async () => {
    const ipfsContent = JSON.parse(await ipfs.cat(dispute.description));
    dispute.mainDescription = ipfsContent.description;
    dispute.reason = ipfsContent.reason;
    dispute.links = ipfsContent.links;
    dispute.entryId = id;
    setIsLoading(false);
  };

  if (dispute) {
    addIpfs();
  }

  if (isLoading) {
    return (
      <div className="text-center" style={{ padding: "256px" }}>
        <div className="spinner-grow spinner-grow-sm text-primary"></div>
        <div className="spinner-grow spinner-grow-sm text-primary ml-2 mr-2"></div>
        <div className="spinner-grow spinner-grow-sm text-primary "></div>
      </div>
    );
  }

  const onSettle = async () => {
    try {
      setButtonLoading(true);
      await daoContract.settleDispute(id);
      window.location.reload();
    } catch (err) {
      alert(err);
    }

    setButtonLoading(false);
  };

  //Check for resolved status and generate the relevant button
  const getVotingButton = () => {
    if (dispute.resolved.toNumber() === 0) {
      return Date.now() < new Date(dispute.expiry) ? (
        <>
          <button
            data-toggle="modal"
            data-target="#dispute-voting-model"
            className="btn btn-outline-success btn-block"
            disabled={dispute.voters.has(account)}
          >
            {dispute.voters.has(account) ? "You have already voted" : "VOTE"}
          </button>
          <p className="mt-1 text-center text-secondary">
            {dispute.votesYes.toNumber()} votes in support.
          </p>
        </>
      ) : (
        <>
          <button
            onClick={onSettle}
            className="btn btn-outline-primary btn-block"
          >
            {buttonLoading && (
              <div className="spinner-border spinner-border-sm" />
            )}
            {buttonLoading ? " Processing Transaction" : "Settle Dispute"}
          </button>
          <p className="mt-1 text-center text-secondary">
            {dispute.votesYes.toNumber()} votes in support.
          </p>
        </>
      );
    } else if (dispute.resolved.toNumber() === 1) {
      return (
        <>
          <button disabled className="btn btn-danger btn-block">
            Entry Disqualified
          </button>
          <p className="mt-1 text-center text-secondary">
            {dispute.votesYes.toNumber()} votes in support.
          </p>
        </>
      );
    } else {
      return (
        <>
          <button disabled className="btn btn-success btn-block">
            Dispute Rejected
          </button>
          <p className="mt-1 text-center text-secondary">
            {dispute.votesNo.toNumber()} votes against.
          </p>
        </>
      );
    }
  };

  return (
    <div className="row">
      {/* dispute Details */}
      <div className="col-md-8">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title">
              Dispute Entry #{id}: {dispute.reason}
            </h2>
            <h4>Description</h4>
            <p className="text-grey">{dispute.mainDescription}</p>
            <h4>Relevants Links</h4>
            <a href={dispute.links}>{dispute.links}</a>
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
                  <td className="text-grey">Disputer</td>
                  <td>
                    <a href={`https://delphi.tzkt.io/${dispute.disputer}`}>
                      {dispute.disputer.slice(0, 10)}...
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="text-grey">Created at</td>
                  <td>
                    <Moment format="DD/MM/YYYY">{dispute.created}</Moment>
                  </td>
                </tr>
                {dispute.resolved === 0 ? (
                  <tr>
                    <td className="text-grey">Ends in</td>
                    <td>
                      <Moment format="DD/MM/YYYY">{dispute.expiry}</Moment>
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
                  <td className="text-grey">Total Voters</td>
                  <td>{dispute.voters.size}</td>
                </tr>
                <tr>
                  <td className="text-grey">Yes Votes</td>
                  <td>{dispute.votesYes.toNumber()}</td>
                </tr>
                <tr>
                  <td className="text-grey">No Votes</td>
                  <td>{dispute.votesNo.toNumber()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Voting Modal */}
      <DisputeVotingModal dispute={dispute} />
    </div>
  );
};

export default DisputeVoting;
