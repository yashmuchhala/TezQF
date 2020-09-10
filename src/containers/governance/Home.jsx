import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const ADMIN_PKH = process.env.REACT_APP_ADMIN_PKH;
function Home() {
  const [numberOfTokens, setNumberOfTokens] = useState(0);
  const [accountTokenBalance, setAccountTokenBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
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
  }, [isCompleted, tokenContract, currentAccountAdress]);

  const onClickApprove = async () => {
    setIsCompleted(false);
    setIsLoading(true);
    const success = await tokenContract.approve(ADMIN_PKH, numberOfTokens);
    if (success === true) {
      setIsCompleted(true);
    }
    setIsLoading(false);
    setNumberOfTokens(0);
  };
  return (
    <div className="container w-75 mb-5">
      <h1>
        Approve the DAO to spend tokens on your behalf. Would be used while
        voting and refunded later.
      </h1>
      <p className="lead">
        Your current token balance:
        {accountTokenBalance == null
          ? " Loading"
          : " " + accountTokenBalance}{" "}
        tokens.
      </p>
      <br />
      <form>
        <label className="font-weight-bold mb-0">
          Amount of tokens to approve
        </label>
        <input
          type="text"
          className="form-control mb-3 col-6"
          placeholder=""
          value={numberOfTokens}
          onChange={(e) => setNumberOfTokens(e.target.value)}
        />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <button
              className="btn btn-lg btn-outline-danger font-weight-bold"
              onClick={onClickApprove}
            >
              Confirm and Approve
            </button>
            <h1>{isCompleted ? "Success!" : ""}</h1>
          </>
        )}
      </form>
    </div>
  );
}

export default Home;
