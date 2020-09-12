import React from "react";
import { Link } from "react-router-dom";
function NoActiveRound() {
  return (
    <div className="container text-center mt-5 mb-5">
      <div className="alert alert-light h2 p-4 m-5">
        <strong>Sorry!</strong> No funding round is active right now, meanwhile
        you can look at our previous funding rounds here
        <Link to="/archive">
          <button className="btn btn-warning ml-2">Archives</button>
        </Link>
      </div>
    </div>
  );
}

export default NoActiveRound;
