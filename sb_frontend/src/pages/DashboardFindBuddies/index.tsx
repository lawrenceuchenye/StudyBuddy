import "./index.css";
import DashboardNavbar from "../../components/DashboardNavbar/";
import { FC, useState, useEffect } from "react";
import { useStudyBudStore } from "../../store/";

const index: FC = () => {
  const isDashboardNavActive = useStudyBudStore(
    (state) => state.isDashboardNavActive,
  );
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    setWidth(window.innerWidth);
  }, [window.innerWidth]);

  return (
    <div className="dashboard-main-container">
      <div className="dnav-container" style={{ width: `${width}px` }}>
        <DashboardNavbar />
      </div>
      <div
        className={
          isDashboardNavActive
            ? "main-user-info-container-a"
            : "main-user-info-container"
        }
      >
        <div className="user-info-card">
          <h1>Welcome back,Dave!!</h1>
          <div className="userprofile-card">
            <div className="userprofile-img-container"></div>
            <div className="userprofile-info-container">
              <h2>dave jmaes</h2>
              <h3>Massachusetts Institute of Technology(MIT)</h3>
              <h4>77 Massachusetts Ave</h4>
              <p>3rd year - Mech. Eng.</p>
            </div>
          </div>
        </div>
        <div className="search-tag">
          <h1>Find the perfect study buddy/group</h1>
          <div className="search-field-container">
            <input type="text" placeholder="what's the @ let's find it." />
            <div className="search-btn">
              <h3>Search</h3>
            </div>
          </div>
        </div>
        <div className="results-container">
          <div className="results-header">
            <h1>Results</h1>
          </div>
          <div className="results-gotten-container">
            <p>No results found.</p>
          </div>
        </div>
        <div className="groups">
          <div className="results-container">
            <div className="results-header">
              <h1>Friends</h1>
            </div>
            <div className="results-gotten-container">
              <p>pretty lonely here.</p>
            </div>
          </div>
          <div className="results-container">
            <div className="results-header">
              <h1>Study Groups</h1>
            </div>
            <div className="results-gotten-container">
              <p>Join a group.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
