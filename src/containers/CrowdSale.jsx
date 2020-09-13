import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

function CrowdSale() {
  const [isCrowdSaleOn, setIsCrowdSaleOn] = useState(null);
  const [numberOfTokens, setNumberOfTokens] = useState(0);
  const [currentUserTokenBalance, setCurrentUserTokenBalance] = useState(null);
  const [tokenPrice, setTokenPrice] = useState(null);
  const [tokenTotalSupply, setTokenTotalSupply] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const crowdSaleContract = useSelector(
    (state) => state.contract.contracts.crowdSale
  );
  const tokenContract = useSelector((state) => state.contract.contracts.token);
  const currentAccountAdress = useSelector(
    (state) => state.credentials.wallet.account
  );

  useEffect(() => {
    const getTokenData = async () => {
      const price = await crowdSaleContract?.getPrice();
      const totalSupply = await crowdSaleContract?.getTotalSupply();
      const isPaused = await crowdSaleContract?.getIsPaused();
      try {
        const userBalance = await tokenContract?.getBalance(
          currentAccountAdress
        );
        setCurrentUserTokenBalance(userBalance?.balance);
      } catch {
        setCurrentUserTokenBalance(0);
      }
      setTokenPrice(price);
      setTokenTotalSupply(totalSupply);
      setIsCrowdSaleOn(!isPaused);
    };
    getTokenData();
  }, [isCompleted, crowdSaleContract, currentAccountAdress, tokenContract]);
  const onSubmit = async () => {
    setIsCompleted(false);
    setIsLoading(true);
    try {
      const success = await crowdSaleContract.buyTokens(
        numberOfTokens,
        numberOfTokens * tokenPrice
      );
      if (success === true) {
        setIsCompleted(true);
      }
    } catch {
      setIsCompleted(false);
    }
    setIsLoading(false);
    setNumberOfTokens(0);
  };
  return (
    <div>
      <div
        className="container mb-5 mt-5"
        style={{
          marginTop: "32px",
          paddingLeft: "96px",
          paddingRight: "96px",
          paddingBottom: "96px",
          backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(assets/images/home-background3.jpg)`,
          backgroundSize: "cover",
          backgroundBlendMode: "lighten",
        }}
      >
        <div className="text-center">
          <span style={{ fontSize: "64px" }}>
            <strong>Crowdsale</strong>{" "}
            <span
              className={
                isCrowdSaleOn == null
                  ? "badge badge-info pt-3"
                  : isCrowdSaleOn
                  ? "badge badge-success pt-3"
                  : "badge badge-danger pt-3"
              }
            >
              {isCrowdSaleOn == null
                ? "wait"
                : isCrowdSaleOn
                ? "live"
                : "unavailable"}
            </span>
          </span>
        </div>
        <div className="row mt-5">
          <div className="col-4 text-right">
            <h1>
              {tokenPrice == null ? (
                <div className="spinner-grow spinner-grow-sm text-secondary text-right mb-3"></div>
              ) : (
                tokenPrice / 1000000
              )}{" "}
              XTZ
            </h1>
            <span className="text-muted">current price</span>
          </div>
          <div className="col-4 text-center">
            <h1>
              {currentUserTokenBalance == null ? (
                <div className="spinner-grow spinner-grow-sm text-secondary text-center mb-3"></div>
              ) : (
                currentUserTokenBalance
              )}{" "}
              XTZ
            </h1>
            <span class="badge badge-danger pl-3 pr-3 p-1">YOUR BALANCE</span>
          </div>
          <div className="col-4 text-left">
            <h1>
              {tokenTotalSupply == null ? (
                <div className="spinner-grow spinner-grow-sm text-secondary text-center ml-3 mb-3"></div>
              ) : (
                <div className="ml-3">{tokenTotalSupply}</div>
              )}
            </h1>
            <span className="text-muted">tokens in supply</span>
          </div>
        </div>
        <form className="pt-5 text-center">
          <label className="font-weight-bold mb-0 text-center text-secondary h2 pt-5">
            ENTER THE NUMBER OF TOKENS YOU WISH TO BUY
          </label>
          <div className="pb-3 text-center center">
            <input
              type="text"
              className="text-center h1 pt-2 mt-2"
              placeholder="0"
              style={{
                width: "35%",
                fontSize: "64px",
                fontWeight: 700,
                borderWidth: "3px",
                borderColor: "lightgray",
                background: "transparent",
              }}
              value={numberOfTokens}
              onChange={(e) => setNumberOfTokens(e.target.value)}
            />
          </div>
          <div className="pb-5">
            <button
              className={`btn btn-lg btn-outline-danger font-weight-bold`}
              disabled={isLoading}
              onClick={onSubmit}
            >
              {isLoading ? (
                <div>
                  Processing
                  <div className="spinner-grow spinner-grow-sm text-danger ml-2 mb-1"></div>
                </div>
              ) : (
                "Confirm + Pay"
              )}
            </button>
            {isCompleted ? (
              <i
                className="fa fa-check-circle pl-3"
                style={{ fontSize: "18px", color: "green" }}
              ></i>
            ) : (
              <span className="text-center text-muted pl-2">
                (total amount to be paid for {numberOfTokens} tokens is{" "}
                {tokenPrice == null
                  ? "?"
                  : (tokenPrice * numberOfTokens) / 1000000}{" "}
                XTZ)
              </span>
            )}
          </div>
        </form>
      </div>
      <div className="text-center pb-5 pl-5 pr-5 pt-3">
        <p className="lead m-3 text-muted" style={{ textAlign: "justify" }}>
          Get tokens on your account to have your share in the governance of
          tezGrants. Make sure you understand the risks involved in buying a
          token. Our token follows the FA1.2 token standard as described in the
          official Tezos documentation. Our governance tokens are very
          restrictive and not listed on any exchanges; their primary purpose is
          to maintain voting weights within the organization.
        </p>
      </div>
    </div>
  );
}

export default CrowdSale;
