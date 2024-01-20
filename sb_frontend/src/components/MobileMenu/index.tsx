import "./index.css";
import React, { FC } from "react";
import { useStudyBudStore } from "../../store/";

const index: FC = () => {
  const toggleIsTapped = useStudyBudStore((state) => state.toggleIsTapped);

  return (
    <div className="mm-main-container" onClick={toggleIsTapped}>
      <div className="mm-info-container" onClick={(e) => e.stopPropagation()}>
        <div className="mm-info-container-nav">
          <h3>Home</h3>
          <h3>Resources</h3>
          <h3>About </h3>
        </div>
        <div className="mm-auth-container">
          <button>
            <h3>
              Log in <i className="fa fa-sign-in"></i>
            </h3>
          </button>
          <button>
            <h3>
              Sign up <i className="fa fa-user-plus"></i>
            </h3>
          </button>
        </div>
      </div>
    </div>
  );
};

export default index;
