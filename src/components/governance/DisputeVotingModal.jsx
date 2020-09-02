import React, { useState } from "react";
import PropTypes from "prop-types";

const DisputeVotingModal = ({ dispute }) => {
  const [weight, setWeight] = useState();
  const [inFavor, setFavor] = useState(true);

  return (
    <div
      class="modal fade"
      id="dispute-voting-model"
      tabindex="-1"
      role="dialog"
      aria-labelledby="dispute-voting-modelLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="dispute-voting-modelLabel">
              Voting Confirmation
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            By confirming, you will be choosing to vote for/against{" "}
            <strong>
              Dispute Entry #{dispute.entryId}: {dispute.title}
            </strong>
            , by depositing your tokens, which shall be returned once dispute is
            resolved
            <div className="row align-items-center no-gutters my-2">
              <div className="col-8">
                <input
                  type="number"
                  class="form-control"
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
          <div class="modal-footer">
            <button type="button" class="btn btn-block btn-primary">
              Confirm Vote using Tokens
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
