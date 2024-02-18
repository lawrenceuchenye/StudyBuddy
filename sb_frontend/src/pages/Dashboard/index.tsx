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

const Group: FC = ({ title, online_m, total_m }) => {
  return (
    <div className="group-item">
      <h1>{title}</h1>
      <div>
        <p>
          <i className="fa fa-dot-circle otagi"></i> {online_m} Online members
        </p>
        <p>
          <i className="fa fa-dot-circle ttagi"></i> {total_m} Members
        </p>
      </div>
      <button>Join Now</button>
    </div>
  );
};

const Lesson: FC = ({ title, online_m, total_m }) => {
  return (
    <div className="group-item">
      <h1>{title}</h1>
      <div>
        <p>
          <i className="fa fa-dot-circle otagi"></i> {online_m} Online Students
        </p>
        <p>
          <i className="fa fa-dot-circle ttagi"></i> {total_m} Students
        </p>
      </div>
      <button>Join Now</button>
    </div>
  );
};

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
    ],
  })[0];

  const [overlayActive, setOverlayActive] = useState<boolean>(false);
  const [sgActive, setStudyGroupActive] = useState<boolean>(false);
  const [lgActive, setLessonsGroupActive] = useState<boolean>(false);

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

  const CardFunc = (type) => {
    setOverlayActive(!overlayActive);
    if (type == "sg") {
      setStudyGroupActive(true);
    } else {
      setStudyGroupActive(false);
    }

    if (type == "lg") {
      setLessonsGroupActive(true);
    } else {
      setLessonsGroupActive(false);
    }
  };

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
          <div onClick={() => CardFunc("sg")} className="dcard-container">
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
          <div onClick={() => CardFunc("lg")} className="dcard-container">
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
          <div onClick={() => CardFunc()} className="dcard-container">
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
      {overlayActive && (
        <div className="overlay" onClick={() => setOverlayActive(false)}>
          {sgActive && (
            <div
              className="groups-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="groups-header">
                <h1>Study groups</h1>
              </div>
              <div className="groups">
                <Group title={"Calculus Nerds"} online_m={3} total_m={20} />
                <Group title={"Botany Buddies"} online_m={25} total_m={530} />
                <Group title={"Algebrats "} online_m={8} total_m={200} />
              </div>
            </div>
          )}
          {lgActive && (
            <div
              className="groups-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="groups-header"
                style={{ background: "var(--color-green)" }}
              >
                <h1>Lessons </h1>
              </div>
              <div className="groups">
                <Lesson
                  title={"Integeral Calculus 101"}
                  online_m={4}
                  total_m={200}
                />
                <Lesson title={"BioPhysic"} online_m={30} total_m={320} />
                <Lesson title={"Algebra II "} online_m={12} total_m={120} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default index;
