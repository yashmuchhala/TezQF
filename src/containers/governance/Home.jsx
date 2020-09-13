import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
const ADMIN_PKH = process.env.REACT_APP_ADMIN_PKH;
function Home() {
  const [accountTokenBalance, setAccountTokenBalance] = useState(0);
  const [numberOfApproveTokens, setNumberOfApproveTokens] = useState(0);
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [isApproveCompleted, setIsApproveCompleted] = useState(false);
  const [numberOfTransferTokens, setNumberOfTransferTokens] = useState(0);
  const [accountToTransferTokensTo, setAccountToTransferTokensTo] = useState(
    ""
  );
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [isTransferCompleted, setIsTransferCompleted] = useState(false);

  const tokenContract = useSelector((state) => state.contract.contracts.token);
  const currentAccountAdress = useSelector(
    (state) => state.credentials.wallet.account
  );

  useEffect(() => {
    const getAccountTokenBalance = async () => {
      const balanceMap = await tokenContract?.getBalance(currentAccountAdress);
      setAccountTokenBalance(balanceMap?.balance);
    };
    getAccountTokenBalance();
  }, [
    isTransferCompleted,
    isApproveCompleted,
    tokenContract,
    currentAccountAdress,
  ]);

  const onSubmitApprove = async () => {
    setIsApproveCompleted(false);
    setIsApproveLoading(true);
    try {
      const success = await tokenContract.approve(
        ADMIN_PKH,
        numberOfApproveTokens
      );
      if (success === true) {
        setIsApproveCompleted(true);
      }
    } catch {
      setIsApproveCompleted(false);
    }
    setIsApproveLoading(false);
    setNumberOfApproveTokens(0);
  };
  const onSubmitTransfer = async () => {
    setIsTransferCompleted(false);
    setIsTransferLoading(true);
    try {
      const success = await tokenContract.transfer(
        currentAccountAdress,
        accountToTransferTokensTo,
        numberOfTransferTokens
      );
      if (success === true) {
        setIsTransferCompleted(true);
      }
    } catch {
      setIsTransferCompleted(false);
    }
    setIsTransferLoading(false);
    setNumberOfTransferTokens(0);
  };
  return (
    <div className="mb-5">
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url(assets/images/home-background4.jpg)`,
          backgroundSize: "cover",
        }}
      >
        <div
          className="lead text-right text-secondary mr-5 pr-5"
          style={{ fontWeight: 700, fontSize: "14px" }}
        >
          <i> BALANCE </i>
          <span
            className="badge badge-info p-2 ml-2"
            style={{ fontSize: "18px" }}
          >
            {accountTokenBalance == null ? (
              <div className="spinner-grow spinner-grow-sm ml-2 mr-2"></div>
            ) : (
              " " + accountTokenBalance
            )}{" "}
            TOKENS
          </span>
        </div>
        <p
          className="m-5 pl-5 pr-5 text-secondary"
          style={{ textAlign: "justify", fontSize: "18px" }}
        >
          Welcome to the Governance page for the tezGrants funding platform. Use
          your governance tokens to vote on important management proposals for
          the funding rounds. As a shareholder, you can start a new proposal to
          conduct a round, vote on an existing proposal to conduct rounds,
          dispute listed projects in an on-going funding round to remove scams,
          plagiarised and malicious projects, and vote on disputed projects that
          are flagged by other shareholders. <br />
          <br />
          To be eligible to vote, you've to first approve the organization
          contract to transfer a certain number of tokens on your behalf to
          stake your share against your vote till the voting period is on.
          Approve a certain amount of tokens to the organization contract's
          account below. You can also transfer your tokens to any address (if
          they're not currently staked) with the transfer option below. Kindly
          peruse the code of conduct documents before you start exercising your
          shareholder powers.
        </p>{" "}
        <div className="" style={{ paddingLeft: "96px" }}>
          <p className="text-muted">
            To vote on executive matters,
            <br /> click on the button below
            <br />
            <Link to="/governance/executive">
              <button type="button" className="btn btn-primary">
                Go to Executive Proposals
              </button>
            </Link>
          </p>
        </div>
        <div
          className=""
          style={{ paddingLeft: "96px", paddingBottom: "192px" }}
        >
          <p className="text-muted">
            To vote on disputed projects,
            <br /> click on the button below
            <br />
            <Link to="/governance/disputes">
              <button type="button" className="btn btn-warning">
                Go to Dispute Settlement
              </button>
            </Link>
          </p>
        </div>
      </div>
      <hr />
      <div className="ml-5 mr-5 mt-5 pr-5 pl-5 pt-3">
        <h2 className="text-secondary" style={{ textAlign: "justify" }}>
          Approve the Decentralized Autonomous Organization (DAO) to spend a
          number of tokens on your behalf. It is mandatory to do so if you want
          to participate in voting.
        </h2>
        <br />
        <form>
          <label className="mb-0 text-muted" style={{ fontSize: "16px" }}>
            NUMBER OF TOKENS TO APPROVE
            <br />
          </label>
          <input
            type="text"
            className="form-control mb-3 col-3"
            placeholder=""
            value={numberOfApproveTokens}
            onChange={(e) => setNumberOfApproveTokens(e.target.value)}
          />

          <div className="pb-5">
            <button
              className={`btn btn-lg btn-outline-danger font-weight-bold`}
              disabled={isApproveLoading}
              onClick={onSubmitApprove}
            >
              {isApproveLoading ? (
                <div>
                  Processing
                  <div className="spinner-grow spinner-grow-sm text-danger ml-2 mb-1"></div>
                </div>
              ) : (
                "Confirm + Approve"
              )}
            </button>
            {isApproveCompleted ? (
              <i
                className="fa fa-check-circle pl-3"
                style={{ fontSize: "18px", color: "green" }}
              ></i>
            ) : (
              <span className="text-center text-muted pl-2"></span>
            )}
          </div>
        </form>
      </div>
      <div className="ml-5 mr-5 mb-5 pt-0 pb-3">
        <div className="alert alert-danger pr-5 pl-5 pt-5">
          <div
            className="text-light text-center"
            style={{ fontSize: "64px", fontWeight: 700 }}
          >
            TRANSFER{" "}
            {isTransferCompleted ? (
              <i
                className="fa fa-check-circle"
                style={{ fontSize: "32px", color: "green" }}
              ></i>
            ) : (
              <span className="text-center text-muted"></span>
            )}
          </div>
          <div className="text-light text-center">
            <i>NOTE: All transfers are final and cannot be reverted.</i>
          </div>
          <div className="row pt-5 pl-5 pr-5">
            <div className="col-4"></div>
            <div className="col-4">
              <form spellCheck="false">
                <label className="mb-0 text-light" style={{ fontSize: "16px" }}>
                  <i>Number of Tokens (to transfer)</i>
                  <br />
                </label>
                <input
                  type="number"
                  className="form-control mb-3 col-12 pl-3 pr-3 pt-4 pb-4 center text-center"
                  placeholder=""
                  value={numberOfTransferTokens}
                  onChange={(e) => setNumberOfTransferTokens(e.target.value)}
                />
                <label className="mb-0 text-light" style={{ fontSize: "12px" }}>
                  <i>Public Key Hash of Account (to transfer to)</i>
                  <br />
                </label>
                <input
                  type="text"
                  className="form-control mb-3 col-12 pl-2 pr-2 pt-4 pb-4 center text-center"
                  style={{
                    fontSize:
                      accountToTransferTokensTo === "" ? "14px" : "10px",
                  }}
                  placeholder="tz1-account-pkh"
                  value={accountToTransferTokensTo}
                  onChange={(e) => setAccountToTransferTokensTo(e.target.value)}
                />

                <div className="pb-5 text-center">
                  <button
                    className={`btn btn-lg btn-outline-secondary font-weight-bold center text-center ml`}
                    disabled={isTransferLoading}
                    onClick={onSubmitTransfer}
                  >
                    {isTransferLoading ? (
                      <div>
                        Processing
                        <div className="spinner-grow spinner-grow-sm text-light ml-2 mb-1"></div>
                      </div>
                    ) : (
                      "Confirm + Transfer"
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="col-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
