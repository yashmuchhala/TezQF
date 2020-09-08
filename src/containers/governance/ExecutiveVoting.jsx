import React from "react";
import { useParams } from "react-router-dom";
import Moment from "react-moment";
import ExecutiveVotingModal from "../../components/governance/ExecutiveVotingModal";

import { useSelector } from "react-redux";
import { useState } from "react";

const ExecutiveVoting = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const account = useSelector((state) => state.credentials.wallet.account);
  const daoContract = useSelector((state) => state.contract.contracts.dao);
  let proposal = useSelector(
    (state) => state.governance.newRoundProposals[id - 1]
  );

  if (!proposal) {
    return <p className="text-center">Loading...</p>;
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
      return (
        <>
          <button disabled className="btn btn-success btn-block">
            Accepted
          </button>
          <p className="mt-1 text-center text-secondary">
            {proposal.votesYes.toNumber()} votes in support.
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
              Proposal to conduct funding round {proposal.name}
            </h2>
            <h4>Description</h4>
            <p className="text-grey">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
              aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
              eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam
              est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
              velit, sed quia non numquam eius modi tempora incidunt ut labore
              et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima
              veniam, quis nostrum exercitationem ullam corporis suscipit
              laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem
              vel eum iure reprehenderit qui in ea voluptate velit esse quam
              nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo
              voluptas nulla pariatur
            </p>
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
            <p>Lorem Ipsum</p>
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
                  {/* Link to tzStats */}
                  <td>{proposal.creator.slice(0, 10)}...</td>
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
      <ExecutiveVotingModal name={proposal.name.toString()} />
    </div>
  );
};

export default ExecutiveVoting;
