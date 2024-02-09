import "./index.css";
import DashboardNavbar from "../../components/DashboardNavbar/";
import { FC, useState, useEffect } from "react";
import { useStudyBudStore } from "../../store/";
import GoalManager from "../../components/GoalManager//";
import { Data } from "./data.tsx";
import { Line } from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import { Chart as ChartJS } from "chart.js/auto";

ChartJS.register(CategoryScale);

const index: FC = () => {
  const isDashboardNavActive = useStudyBudStore(
    (state) => state.isDashboardNavActive,
  );

  const chartData = useState({
    labels: Data.map((data) => data.year),
    datasets: [
      {
        label: "CGPA",
        data: Data.map((data) => data.gpa),
        tension: 0.2,
      },
      {
        label: "Goals Completed",
        data: Data.map((data) => data.goals),
        tension: 0.2,
      },
    ],
  })[0];

  const tasks = useState([
    {
      title: "Study Calc 204",
      time: "3:40pm",
    },
    {
      title: "Study Stats 240",
      time: "2:40pm",
    },
  ])[0];

  const [width, setWidth] = useState<number | null>(null);

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
          <h1>Crush those Goals,Dave!!!</h1>
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

        <div
          className={
            isDashboardNavActive ? "chart-container-a" : "chart-container"
          }
        >
          <Line data={chartData} />
        </div>
        <div className="goals-tracker">
          <div className="gt-header">
            <h1>Progress</h1>
            <p>1/2</p>
          </div>
          <div className="tracker-bar">
            <div className="tracker-thumb"></div>
          </div>
        </div>
        <GoalManager Tasks={tasks} />
      </div>
    </div>
  );
};

export default index;
