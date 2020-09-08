import React from "react";
import { useParams } from "react-router-dom";
import Moment from "react-moment";
import DisputeVotingModal from "../../components/governance/DisputeVotingModal";

//Dummy data
import { disputes } from "../../data/disputes";

const DisputeVoting = () => {
  const { roundId, id } = useParams();

  //Retrieve Dispute Object (Replace with contract retrieval)
  const dispute = disputes[roundId - 1].disputes.filter(
    (dispute) => dispute.entryId === parseInt(id)
  )[0];

  //Check for resolved status and generate the relevant button
  const getVotingButton = () => {
    if (dispute.resolved === 0) {
      return (
        <>
          <button
            data-toggle="modal"
            data-target="#dispute-voting-model"
            className="btn btn-outline-success btn-block"
          >
            Vote
          </button>
          <p className="mt-1 text-center text-secondary">
            {dispute.votesYes} votes in support.
          </p>
        </>
      );
    } else if (dispute.resolved === 1) {
      return (
        <>
          <button disabled className="btn btn-danger btn-block">
            Entry Disqualified
          </button>
          <p className="mt-1 text-center text-secondary">
            {dispute.votesYes} votes in support.
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
            {dispute.votesNo} votes against.
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
              Dispute Entry #{dispute.entryId}: {dispute.title}
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
            <h4>Relevants Links</h4>
            <a href={dispute.link}>{dispute.link}</a>
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
                  {/* Link to tzStats */}
                  <td>{dispute.disputer.slice(0, 10)}...</td>
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
                  <td className="text-grey">Total Votes</td>
                  <td>{dispute.votes}</td>
                </tr>
                <tr>
                  <td className="text-grey">Yes Votes</td>
                  <td>{dispute.votesYes}</td>
                </tr>
                <tr>
                  <td className="text-grey">No Votes</td>
                  <td>{dispute.votesNo}</td>
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
