import "./index.css";
import { FC } from "react";
import { useStudyBudStore } from "../../store/";
import { NavLink } from "react-router-dom";
//@ts-ignore
const index: FC = () => {
  //  const [isTapped, setIsTapped] = useState<boolean>(false);
  const isTapped = useStudyBudStore((state) => state.isTapped);
  const toggleIsTapped = useStudyBudStore((state) => state.toggleIsTapped);

  return (
    <div className="main-nav-container">
      <div tabindex="0" aria-label="study buddy logo initials" className="logo-container">
        <i>
          <h1>
            <span>S</span>
            <span>B</span>
          </h1>
        </i>
      </div>
      <div className="nav-links-container">
        <NavLink
          tabindex="0"
          to="/"
          className="navLink"
          style={{ color: "var(--color-orange)", textDecoration: "none" }}
        >
          <h3> Home</h3>
        </NavLink>

        <h3 tabindex="0">Resources</h3>
        <h3 tabindex="0">About</h3>

        <NavLink
          tabindex="0"
          className="navLink"
          to="/dashboard"
          style={{ color: "var(--color-orange)", textDecoration: "none" }}
        >
          <h3>Dashboard</h3>
        </NavLink>
      </div>
      <div className="auth-container">
        <NavLink
          className="navLink"
          tabindex="0"
          role="button"
          to="login/"
          style={{ color: "var(--color-white)", textDecoration: "none" }}
        >
          <button>
            <h3>
              Log in <i className="fa fa-sign-in"></i>
            </h3>
          </button>
        </NavLink>
        <NavLink
          to="signup/"
          tabindex="0"
          role="button"
          className="navLink"
          style={{ color: "var(--color-white)", textDecoration: "none" }}
        >
          <button>
            <h3>
              Sign up <i className="fa fa-user-plus"></i>
            </h3>{" "}
          </button>
        </NavLink>
      </div>
      <div
        tabindex="0"
        className="ham_parent_container"
        onClick={toggleIsTapped}
      >
        <div className={isTapped ? "ham_open" : "ham"}></div>
      </div>
    </div>
  );
};

export default index;
