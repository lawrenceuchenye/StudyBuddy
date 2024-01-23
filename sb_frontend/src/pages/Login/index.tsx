import "./index.css";
import React from "react";

const index = (props: {}) => {
  return (
    <div className="form-auth-container">
      <div className="form-container">
        <div className="form-img-container">
          <h1>
            back for <span>more book</span> adventure
          </h1>
        </div>
        <div className="main-form-container">
          <h1>Let's grind</h1>
          <div className="form-fields-container">
            <input type="text" placeholder="@email address" />
            <input type="password" placeholder="password" />
            <button>Log in</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
