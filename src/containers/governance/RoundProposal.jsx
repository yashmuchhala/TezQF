import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

const RoundProposal = ({ instance }) => {
  const [name, setName] = useState("");
  const [start, setStart] = useState(new Date().toISOString().split("T")[0]);
  const [end, setEnd] = useState(new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const daoContract = useSelector((state) => state.contract.contracts.dao);

  const history = useHistory();

  /*
    Changes to be made:
    - name parameter is the number for the current round and should be auto generated based on the last listed round id (retrieve it from the round contract)
    - change name to IPFS hash
  */

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const startTimestamp = new Date(start).getTime() / 1000;
      const endTimestamp = new Date(end).getTime() / 1000;

      await daoContract.proposeNewRound(name, startTimestamp, endTimestamp);

      history.push("/governance/executive");
    } catch (err) {
      alert(err);
    }

    setLoading(false);
  };

  return (
    <div className="container w-75 mb-5">
      <h1>Setup New Funding Round Proposal</h1>
      <p className="lead">
        You are about to setup a new funding round proposal. You must be a
        holder of at least 2000 DAO tokens, in order to confirm this
        transaction.
      </p>
      <br />
      <form>
        <label className="font-weight-bold mb-0">Round Name</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Mega Funding Round September"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="row no-gutters">
          <div className="col mr-2">
            <label className="font-weight-bold mb-0">Start Date</label>
            <input
              type="date"
              className="form-control mb-3"
              placeholder="Start Date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="col ml-2">
            <label className="font-weight-bold mb-0">End Date</label>
            <input
              type="date"
              className="form-control mb-3"
              placeholder="End Date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
        <label className="font-weight-bold mb-0">Entry Categories</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Categories"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
        />
        <label className="font-weight-bold mb-0">Description</label>
        <textarea
          type="text"
          className="form-control mb-3"
          placeholder="Enter a short description for the proposed funding round..."
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="btn btn-lg btn-outline-primary font-weight-bold"
          onClick={onSubmit}
        >
          {loading && <div className="spinner-border" />}
          {!loading ? "Confirm Proposal" : " Processing"}
        </button>
      </form>
    </div>
  );
};

export default RoundProposal;
