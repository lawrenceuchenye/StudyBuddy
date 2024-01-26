import "./index.css";
import React, { FC } from "react";

const index: FC = () => {
  return (
    <div className="cmp-nav-container">
      <div className="link">
        <h1>Profile</h1>

        <i className="fa-solid fa-user"></i>
      </div>

      <div className="link">
        <h1>Goals</h1>

        <i className="fa-solid fa-bullseye"></i>
      </div>
      <div className="link">
        <h1>Match</h1>

        <i className="fa-solid fa-users"></i>
      </div>
      <div className="link">
        <h1>Tutor</h1>

        <i className="fa-solid fa-chalkboard-teacher"></i>
      </div>
      <div className="link">
        <h1>Share</h1>

        <i className="fa-solid fa-share"></i>
      </div>
    </div>
  );
};

export default index;
