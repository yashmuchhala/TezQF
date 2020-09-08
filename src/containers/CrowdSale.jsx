import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

function CrowdSale() {
  const [numberOfTokens, setNumberOfTokens] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(null);
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const crowdSaleContract = useSelector(
    (state) => state.contract.contracts.crowdSale
  );
  useEffect(() => {
    const getTokenPrice = async () => {
      const price = await crowdSaleContract?.getPrice();
      const totalSupply = await crowdSaleContract?.getTotalSupply();
      setTokenPrice(price);
      setTokenTotalSupply(totalSupply);
    };
    getTokenPrice();
  }, [isCompleted, crowdSaleContract]);
  const onClickBuy = async () => {
    setIsCompleted(false);
    setIsLoading(true);
    const success = await crowdSaleContract.buyTokens(
      numberOfTokens,
      numberOfTokens * tokenPrice
    );
    if (success === true) {
      setIsCompleted(true);
    }
    setIsLoading(false);
    setNumberOfTokens(0);
  };
  return (
    <div className="container w-75 mb-5">
      <h1>Crowdsale is ON</h1>
      <p className="lead">
        Buy tokens to be part of the Governance of TezQF. Current Price:
        {tokenPrice == null ? " Loading" : " " + tokenPrice / 1000000} XTZ.
        Total tokens bought till now:{" "}
        {tokenTotalSupply == null ? "Loading" : tokenTotalSupply}. Required XTZ:{" "}
        {(tokenPrice * numberOfTokens) / 1000000}.
      </p>
      <br />
      <form>
        <label className="font-weight-bold mb-0">Amount of tokens to buy</label>
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
              onClick={onClickBuy}
            >
              Pay & Buy
            </button>
            <h1>{isCompleted ? "Success!" : ""}</h1>
          </>
        )}
      </form>
    </div>
  );
}

export default CrowdSale;
