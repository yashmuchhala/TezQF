import React, { useState } from "react";
import { useSelector } from "react-redux";
const Sponsor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);

  const daoContract = useSelector((state) => state.contract.contracts.dao);
  const { newRoundProposals, newRoundProposalActive } = useSelector(
    (state) => state.governance
  );

  const proposal = newRoundProposalActive
    ? newRoundProposals[newRoundProposals.length - 1]
    : null;

  const onSubmit = async () => {
    setIsCompleted(false);
    setIsLoading(true);
    try {
      await daoContract.donateToRound(name, amount * 1000000);
      setIsCompleted(true);
      window.location.reload();
    } catch (err) {
      alert(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="container d-flex align-items-center flex-column mb-5">
      {/* Header */}
      <h1 className="font-weight-light">
        {proposal ? `Sponsor Round ${proposal.id}` : `Become a Sponsor`}
      </h1>
      <h4 className="text-center font-weight-light mb-3">
        Help young projects grow by sponsoring a match funding round.
      </h4>

      {/* Form */}

      {proposal && (
        <div className="card w-75">
          <div className="card-body form-group">
            <h4 className="text-center font-weight-light mb-3">
              Funds in the pool
            </h4>
            <h2 className="text-center text-success">
              XTZ {proposal.totalFunds.toNumber() / 1000000}
            </h2>
            <h4 className="text-center mb-3">
              donated by {proposal.sponsorToFunds.size} unique contributor(s)
            </h4>

            <label className="font-weight-bold mb-0">Name</label>
            <input
              type="text"
              className="form-control w-100 mb-3"
              placeholder="Name"
              aria-label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="font-weight-bold mb-0">Amount (in XTZ)</label>
            <input
              type="text"
              className="form-control w-100 mb-3"
              placeholder="Amount (in XTZ)"
              aria-label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              className="btn btn-primary btn-block font-weight-bold"
              onClick={onSubmit}
            >
              {isLoading ? "PROCESSING TRANSACTION " : "CONFIRM"}
              {isLoading && <div className="spinner-grow spinner-grow-sm" />}
            </button>

            <h1>{isCompleted ? "Success!" : ""}</h1>
          </div>
        </div>
      )}
      {newRoundProposals?.length === 0 ? (
        <div className="text-center text-primary" style={{ padding: "128px" }}>
          <div className="spinner-grow spinner-grow-sm text-info" />
          <div className="spinner-grow spinner-grow-sm text-info ml-2 mr-2" />
          <div className="spinner-grow spinner-grow-sm text-info" />
        </div>
      ) : (
        !proposal && (
          <div
            className="text-center lead"
            style={{ paddingTop: "120px", paddingBottom: "100px" }}
          >
            No Funding Round is accepting sponsors right now. Head over to the
            governance page to view or propose a new round.
          </div>
        )
      )}
    </div>
  );
};

export default Sponsor;
