import React from "react";
import { Link } from "react-router-dom";

const RoundsHome = () => {
  return (
    <div>
      <h1 className="font-weight-light mb-3">QuadDAO Rounds</h1>
      <h4 className="font-weight-light">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quisquam modi,
        optio amet deserunt ratione magni! Repudiandae provident nobis velit quo
        ipsam, ut at quidem omnis. Dignissimos culpa quae commodi ad?
      </h4>
      <button className="btn btn-success mr-3">Enter Round</button>
      <button className="btn btn-primary">Know More</button>
      <hr />
      <h4 className="text-center mt-5">
        Funding Round 5 is here! We have 15 sponsors bringing in $25000 to the
        match pool. <Link to="/rounds/contribute">Contribute</Link> now to your
        favourite projects
      </h4>
    </div>
  );
};

export default RoundsHome;
