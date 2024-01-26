import "./index.css";
import DashboardNavbar from "../../components/DashboardNavbar/";
import React, { FC, useState } from "react";
import { Data } from "./data.tsx";

import { Line } from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import { Chart as ChartJS } from "chart.js/auto";

ChartJS.register(CategoryScale);

const index: FC = (props: {}) => {
  const [chartData, setChartData] = useState({
    labels: Data.map((data) => data.year),
    datasets: [
      {
        label: "CGPA",
        data: Data.map((data) => data.gpa),
      },
    ],
  });
  console.log(chartData);
  return (
    <div className="dashboard-main-container">
      <div>
        <DashboardNavbar />
      </div>
      <div className="main-user-info-container">
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
          <div className="dcard-container"></div>
          <div className="dcard-container"></div>
          <div className="dcard-container"></div>
        </div>

        <div>
          <Line data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default index;
