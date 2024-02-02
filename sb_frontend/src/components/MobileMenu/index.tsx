import "./index.css";
import { FC } from "react";
import { useStudyBudStore } from "../../store/";
import { NavLink } from "react-router-dom";

const index: FC = () => {
  const toggleIsTapped = useStudyBudStore((state) => state.toggleIsTapped);

  return (
    <div className="mm-main-container" onClick={toggleIsTapped}>
      <div className="mm-info-container" onClick={(e) => e.stopPropagation()}>
        <div className="mm-info-container-nav">
          <NavLink
            to="/"
            style={{ color: "var(--color-black)", textDecoration: "none" }}
          >
            <h3>Home</h3>
          </NavLink>
          <h3>Resources</h3>
          <h3>About </h3>
        </div>
        <div className="mm-auth-container">
          <button>
            <NavLink
              to="login/"
              style={{ color: "var(--color-white)", textDecoration: "none" }}
            >
              <h3>
                Log in <i className="fa fa-sign-in"></i>
              </h3>
            </NavLink>
          </button>
          <button>
            <h3>
              <NavLink
                to="signup/"
                style={{ color: "var(--color-white)", textDecoration: "none" }}
              >
                Sign up <i className="fa fa-user-plus"></i>
              </NavLink>
            </h3>
          </button>
        </div>
      </div>
    </div>
  );
};

export default index;
