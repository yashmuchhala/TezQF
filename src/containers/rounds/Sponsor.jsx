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

  //MUST UNCOMMENT LATER ON

  const proposal = newRoundProposalActive
    ? newRoundProposals[newRoundProposals.length - 1]
    : null;

  // const proposal = newRoundProposals[newRoundProposals.length - 1];

  const onSubmit = async () => {
    setIsCompleted(false);
    setIsLoading(true);
    const success = await daoContract.donateToRound(name, amount * 1000000);
    if (success) {
      setIsCompleted(true);
    }
    setIsLoading(false);
  };
  return (
    <div className="container d-flex align-items-center flex-column mb-5">
      {/* Header */}
      <h1 className="font-weight-light">
        {proposal ? `Sponsor Round ${proposal.name}` : `Become a Sponsor`}
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
              donated by {proposal.sponsorToFunds.size} unique contributors
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
            {isLoading ? (
              "Loading"
            ) : (
              <>
                <button
                  className="btn btn-primary btn-block font-weight-bold"
                  onClick={onSubmit}
                >
                  CONFIRM
                </button>

                <h1>{isCompleted ? "Success!" : ""}</h1>
              </>
            )}
          </div>
        </div>
      )}
      {!proposal && (
        <div
          className="text-center lead"
          style={{ paddingTop: "120px", paddingBottom: "100px" }}
        >
          No Funding Round is active right now. Head over to the governance page
          to view or propose a new round.
        </div>
      )}
    </div>
  );
};

export default Sponsor;
