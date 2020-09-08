import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const ExecutiveVotingModal = ({ name }) => {
  const [weight, setWeight] = useState(0);
  const [inFavor, setFavor] = useState(true);
  const [loading, setLoading] = useState(false);

  const daoContract = useSelector((state) => state.contract.contracts.dao);

  const onVote = async () => {
    if (weight === 0) {
      alert("You must vote using at least 1 token!");
    } else {
      try {
        setLoading(true);
        await daoContract.voteForNewRoundProposal(inFavor, weight);
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
      id="executive-voting-model"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="executive-voting-modelLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="executive-voting-modelLabel">
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
            <strong>Proposal to conduct funding round {name}</strong>, by
            depositing your tokens, which shall be returned after proposal
            execution.
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
                ? " Processing Transaction"
                : "Confirm Vote using Tokens"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ExecutiveVotingModal.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ExecutiveVotingModal;
