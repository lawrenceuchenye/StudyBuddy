import "./index.css";
import React, { FC, useState } from "react";

const index: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={isOpen ? "cmp-nav-container_open" : "cmp-nav-container_closed"}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="link" onClick={(e) => e.stopPropagation()}>
        <i className="fa-solid fa-user"></i>

        <h1>Profile</h1>
      </div>

      <div className="link" onClick={(e) => e.stopPropagation()}>
        <i className="fa-solid fa-bullseye"></i>

        <h1>Goals</h1>
      </div>
      <div className="link" onClick={(e) => e.stopPropagation()}>
        <i className="fa-solid fa-users"></i>

        <h1>Match</h1>
      </div>
      <div className="link" onClick={(e) => e.stopPropagation()}>
        <i className="fa-solid fa-chalkboard-teacher"></i>

        <h1>Tutor</h1>
      </div>
      <div className="link" onClick={(e) => e.stopPropagation()}>
        <i className="fa-solid fa-share"></i>

        <h1>Share</h1>
      </div>
    </div>
  );
};

export default index;
