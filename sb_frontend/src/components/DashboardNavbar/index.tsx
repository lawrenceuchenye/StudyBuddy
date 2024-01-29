import "./index.css";
import { FC, useEffect, useState } from "react";
import { useStudyBudStore } from "../../store";
import { NavLink } from "react-router-dom";

const index: FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  const isDashboardNavActive = useStudyBudStore(
    (state) => state.isDashboardNavActive,
  );
  const toggleIsDashboardNavActive = useStudyBudStore(
    (state) => state.toggleIsDashboardNavActive,
  );

  useEffect(() => {
    if (window.innerWidth < 750) {
      setIsMobile(true);
      return;
    }

    setIsMobile(false);
  }, []);

  if (isMobile) {
    return (
      <div className="mb-nav-container">
        <NavLink
          to="/dashboard"
          style={{ color: "var(--color-white)", textDecoration: "none" }}
        >
          <div className="link" onClick={(e) => e.stopPropagation()}>
            <i className="fa-solid fa-user"></i>

            <h1>Profile</h1>
          </div>
        </NavLink>

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
        <div className="alink">
          <div className="link" onClick={(e) => e.stopPropagation()}>
            <i className="fa-solid fa-share"></i>

            <h1>Share</h1>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={
        isDashboardNavActive
          ? "cmp-nav-container_open"
          : "cmp-nav-container_closed"
      }
      onClick={() => toggleIsDashboardNavActive()}
    >
      <NavLink
        to="/dashboard"
        style={{ color: "var(--color-white)", textDecoration: "none" }}
      >
        <div className="link" onClick={(e) => e.stopPropagation()}>
          <i className="fa-solid fa-user"></i>

          <h1>Profile</h1>
        </div>
      </NavLink>
      <NavLink
        to="/dashboard/goals"
        style={{ color: "var(--color-white)", textDecoration: "none" }}
      >
        <div className="link" onClick={(e) => e.stopPropagation()}>
          <i className="fa-solid fa-bullseye"></i>

          <h1>Goals</h1>
        </div>
      </NavLink>

      <NavLink
        to="/dashboard/find-match-buddies"
        style={{ color: "var(--color-white)", textDecoration: "none" }}
      >
        <div className="link" onClick={(e) => e.stopPropagation()}>
          <i className="fa-solid fa-users"></i>

          <h1>Match</h1>
        </div>
      </NavLink>
      <NavLink
        to="/dashboard"
        style={{ color: "var(--color-white)", textDecoration: "none" }}
      >
        <div className="link" onClick={(e) => e.stopPropagation()}>
          <i className="fa-solid fa-chalkboard-teacher"></i>

          <h1>Tutor</h1>
        </div>
      </NavLink>
      <div className="alink">
        <div className="link" onClick={(e) => e.stopPropagation()}>
          <i className="fa-solid fa-share"></i>

          <h1>Share</h1>
        </div>
      </div>
    </div>
  );
};

export default index;
