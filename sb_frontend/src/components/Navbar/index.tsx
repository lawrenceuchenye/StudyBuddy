import "./index.css";
import React, { FC } from "react";

const index: FC = () => {
  return (
    <div className="main-nav-container">
      <div className="logo-container">
        <i>
          <h1>
            <span>S</span>
            <span>B</span>
          </h1>
        </i>
      </div>
      <div className="nav-links-container">
        <h3>Home</h3>
        <h3>Resources</h3>
        <h3>About</h3>
      </div>
      <div className="auth-container">
        <button>
          <h3>
            Log in <i className="fa fa-sign-in"></i>
          </h3>{" "}
        </button>
        <button>
          <h3>
            Sign up <i className="fa fa-user-plus"></i>
          </h3>{" "}
        </button>
      </div>
    </div>
  );
};

export default index;
