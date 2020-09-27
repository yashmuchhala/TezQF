import React, { useState } from "react";
import { useSelector } from "react-redux";

import PropTypes from "prop-types";

const DisputeVotingModal = ({ dispute }) => {
  const [weight, setWeight] = useState();
  const [inFavor, setFavor] = useState(true);
  const [loading, setLoading] = useState(false);

  const daoContract = useSelector((state) => state.contract.contracts.dao);

  const onVote = async () => {
    if (weight === 0) {
      alert("You must vote using at least 1 token!");
    } else {
      try {
        setLoading(true);
        await daoContract.voteForDispute(dispute.entryId, inFavor, weight);
        window.location.reload();
      } catch (err) {
        console.log(err);
        alert(err);
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="modal fade"
      id="dispute-voting-model"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="dispute-voting-modelLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="dispute-voting-modelLabel">
              Voting Confirmation
            </h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            By confirming, you will be choosing to vote for/against{" "}
            <strong>
              Dispute Entry #{dispute.entryId}: {dispute.reason},
            </strong>{" "}
            by depositing your tokens, which shall be returned once dispute is
            resolved
            <div className="row align-items-center no-gutters my-2">
              <div className="col-8">
                <input
                  type="number"
                  className="form-control"
                  value={weight}
                  name="weight"
                  placeholder="Voting weight..."
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="ml-3">
                  <input
                    id="inFavor"
                    type="checkbox"
                    name="inFavor"
                    onChange={(e) => setFavor(!inFavor)}
                    checked={inFavor}
                  />{" "}
                  in favour
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              onClick={onVote}
              type="button"
              className="btn btn-block btn-primary"
            >
              {loading && <div className="spinner-border spinner-border-sm" />}
              {loading
                ? " PROCESSING TRANSACTION"
                : "CONFIRM VOTE USING TOKENS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DisputeVotingModal.propTypes = {
  dispute: PropTypes.object.isRequired,
};

export default DisputeVotingModal;
