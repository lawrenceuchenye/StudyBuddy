import "./index.css";
import DashboardNavbar from "../../components/DashboardNavbar/";
import { FC, useState, useEffect } from "react";
import { useStudyBudStore } from "../../store/";
import TaskManager from "../../components/TaskManager//";
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

  useEffect(() => {
    console.log(isDashboardNavActive);
  }, []);

  return (
    <div className="dashboard-main-container">
      <div className="dnav-container">
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
        <div className="dcards-container">
          <div className="dcard-container">
            <h1>Study Groups</h1>
            <p>
              Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
              sint cillum sint consectetur cupidatat.
            </p>
            <div className="stats">
              <p>
                <i className="fa fa-user-group"></i> 55
              </p>
            </div>
          </div>
          <div className="dcard-container">
            <h1>Lessons</h1>
            <p>
              Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
              sint cillum sint consectetur cupidatat.
            </p>
            <div className="stats">
              <p>
                <i className="fa-solid fa-chalkboard-teacher"></i> 55
              </p>
            </div>
          </div>
          <div className="dcard-container">
            <h1>contribute</h1>
            <p>
              Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
              sint cillum sint consectetur cupidatat.
            </p>
          </div>
        </div>

        <div
          className={
            isDashboardNavActive ? "chart-container-a" : "chart-container"
          }
        >
          <Line data={chartData} />
        </div>
        <TaskManager Tasks={tasks} />
      </div>
    </div>
  );
};

export default index;
