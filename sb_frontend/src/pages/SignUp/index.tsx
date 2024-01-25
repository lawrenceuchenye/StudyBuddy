import "./index.css";
import React from "react";

const index = (props: {}) => {
  return (
    <div className="form-auth-container">
      <div className="form-container">
        <div className="form-img-container">
          <h1>
            <span>Nice</span> to meet new <span>people</span>
          </h1>
        </div>
        <div className="main-form-container">
          <h1>Create an account</h1>
          <p>Sign up now and blast those goals</p>
          <div className="form-fields-container">
            <input type="text" placeholder="@email address" />
            <input type="password" placeholder="password" />
            <input type="password" placeholder="confirm password " />
            <button>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
