import "./index.css";
import { FC, useEffect, useState } from "react";
import { useStudyBudStore } from "../../store";
import { NavLink } from "react-router-dom";

const index: FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [width, setWidth] = useState<number>(0);

  const isDashboardNavActive = useStudyBudStore(
    (state) => state.isDashboardNavActive,
  );
  const activeDashboardPage = useStudyBudStore(
    (state) => state.activeDashboardPage,
  );

  const setActiveDashboardPage = useStudyBudStore(
    (state) => state.setActiveDashboardPage,
  );

  const toggleIsDashboardNavActive = useStudyBudStore(
    (state) => state.toggleIsDashboardNavActive,
  );

  useEffect(() => {
    setWidth(window.innerWidth);
    if (window.innerWidth < 750) {
      setIsMobile(true);
      return;
    }
    console.log(width);
    setIsMobile(false);
  }, [window.innerWidth, activeDashboardPage]);

  if (isMobile) {
    return (
      <div className="mb-nav-container" style={{ width: `${width - 30}px` }}>
        <NavLink
          to="/dashboard"
          style={{ color: "var(--color-white)", textDecoration: "none" }}
        >
          <div
            className={
              !(activeDashboardPage() == "Profile")
                ? "mb-link"
                : "mb-link active-link"
            }
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <i className="fa-solid fa-user"></i>

            <h1>Profile</h1>
          </div>
        </NavLink>
        <NavLink
          to="/dashboard/goals"
          style={{ color: "var(--color-white)", textDecoration: "none" }}
        >
          <div
            className={
              !(activeDashboardPage() == "Goals")
                ? "mb-link"
                : "mb-link active-link"
            }
            onClick={(e) => {
              e.stopPropagation();
              setActiveDashboardPage("Goals");
            }}
          >
            <i className="fa-solid fa-bullseye"></i>

            <h1>Goals</h1>
          </div>
        </NavLink>
        <NavLink
          to="/dashboard/find-match-buddies"
          style={{ color: "var(--color-white)", textDecoration: "none" }}
        >
          <div
            className={
              !(activeDashboardPage() == "Match")
                ? "mb-link"
                : "mb-link active-link"
            }
            onClick={(e) => {
              e.stopPropagation();
              setActiveDashboardPage("Match");
            }}
          >
            <i className="fa-solid fa-users"></i>

            <h1>Match</h1>
          </div>
        </NavLink>
        <NavLink
          to="/dashboard/tutor"
          style={{ color: "var(--color-white)", textDecoration: "none" }}
        >
          <div
            className={
              !(activeDashboardPage() == "Tutor")
                ? "mb-link"
                : "mb-link active-link"
            }
            onClick={(e) => {
              e.stopPropagation();
              setActiveDashboardPage("Tutor");
            }}
          >
            <i className="fa-solid fa-chalkboard-teacher"></i>

            <h1>Tutor</h1>
          </div>
        </NavLink>
        <NavLink
          to="/dashboard/goals"
          style={{ color: "var(--color-white)", textDecoration: "none" }}
        >
          <div className="mb-link" onClick={(e) => e.stopPropagation()}>
            <i className="fa-solid fa-share"></i>

            <h1>Share</h1>
          </div>
        </NavLink>
        <div className="mb-link"></div>
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
        <div
          className={
            !(activeDashboardPage() == "Profile") ? "link" : "link active-link"
          }
          onClick={(e) => {
            e.stopPropagation();
            setActiveDashboardPage("Profile");
          }}
        >
          <i className="fa-solid fa-user"></i>

          <h1>Profile</h1>
        </div>
      </NavLink>
      <NavLink
        to="/dashboard/goals"
        style={{ color: "var(--color-white)", textDecoration: "none" }}
      >
        <div
          className={
            !(activeDashboardPage() == "Goals") ? "link" : "link active-link"
          }
          onClick={(e) => {
            e.stopPropagation();
            setActiveDashboardPage("Goals");
          }}
        >
          <i className="fa-solid fa-bullseye"></i>

          <h1>Goals</h1>
        </div>
      </NavLink>

      <NavLink
        to="/dashboard/find-match-buddies"
        style={{ color: "var(--color-white)", textDecoration: "none" }}
      >
        <div
          className={
            !(activeDashboardPage() == "Match") ? "link" : "link active-link"
          }
          onClick={(e) => {
            e.stopPropagation();
            setActiveDashboardPage("Match");
          }}
        >
          <i className="fa-solid fa-users"></i>

          <h1>Match</h1>
        </div>
      </NavLink>
      <NavLink
        to="/dashboard/tutor/"
        style={{ color: "var(--color-white)", textDecoration: "none" }}
      >
        <div
          className={
            !(activeDashboardPage() == "Tutor") ? "link" : "link active-link"
          }
          onClick={(e) => {
            e.stopPropagation();
            setActiveDashboardPage("Tutor");
          }}
        >
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
