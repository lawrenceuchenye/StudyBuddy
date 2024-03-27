import "./index.css";
import DashboardNavbar from "../../components/DashboardNavbar/";
import { FC, useState, useEffect } from "react";
import { useStudyBudStore } from "../../store/";
import TaskManager from "../../components/TaskManager//";
import { Data } from "./data.tsx";
import { Line } from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import { Chart as ChartJS } from "chart.js/auto";
import { NavLink } from "react-router-dom";
ChartJS.register(CategoryScale);

const Group: FC = ({ title, online_m, total_m }) => {
  return (
    <div className="group-item">
      <h1>
        {title}
      </h1>
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

  const CGPADATA = useStudyBudStore((state) => state.CGPAData);
  const _addGPA = useStudyBudStore((state) => state.addGPA);
  const _removeGPA = useStudyBudStore((state) => state.removeGPA);
  const overlayActive = useStudyBudStore((state) => state.overlayActive);
  const setOverlayActive = useStudyBudStore((state) => state.setOverlayActive);
  const isAddTaskFormOpen = useStudyBudStore(
    (state) => state.isAddTaskFormOpen,
  );
  const setIsAddTaskFormOpen = useStudyBudStore(

    (state) => state.setIsAddTaskFormOpen,
  );

  const [chartData, setChartData] = useState({
    labels: CGPADATA.map((data) => data.session),
    datasets: [
      {
        label: "CGPA",
        data: CGPADATA.map((data) => data.gpa),
        tension: 0.2,
      },
    ],
  });
  const addTask = useStudyBudStore((state) => state.addTask);

  const [sgActive, setStudyGroupActive] = useState<boolean>(false);
  const [lgActive, setLessonsGroupActive] = useState<boolean>(false);
  const [gpTable, setGPTable] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskTime, setTaskTime] = useState<string>("");
  const [session, setSession] = useState<string>("");
  const [gpa, setGPA] = useState<number>(0);

  const addGPA = () => {
    _addGPA({ id: Math.random(), session: session, gpa: gpa });

    setSession("");
    setGPA(0);
    setChartData({
      labels: CGPADATA.map((data) => data.session),
      datasets: [
        {
          label: "CGPA",
          data: CGPADATA.map((data) => data.gpa),
          tension: 0.2,
        },
      ],
    });
  };

  const removeGPA = (id) => {
    _removeGPA(id);
    setChartData({
      labels: CGPADATA.map((data) => data.session),
      datasets: [
        {
          label: "CGPA",
          data: CGPADATA.map((data) => data.gpa),
          tension: 0.2,
        },
      ],
    });
  };

  useEffect(() => {}, [chartData]);

  const Reset = () => {
    setOverlayActive(false);
    setStudyGroupActive(false);
    setLessonsGroupActive(false);
    setGPTable(false);
    setIsAddTaskFormOpen(false);
  };

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

    if (type == "gp") {
      setGPTable(true);
    } else {
      setGPTable(false);
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
              <p>3rd session - Mech. Eng.</p>
            </div>
          </div>
        </div>
        <div className="dcards-container">
          <div onClick={() => CardFunc("sg")} className="dcard-container">
            <h1>
              Study Groups{" "}
              <i
                className="fa-solid fa-book-open-reader"
                style={{ marginLeft: "12px" }}
              ></i>
            </h1>
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
            <h1>
              Lessons{" "}
              <i
                className="fa-solid fa-graduation-cap"
                style={{ marginLeft: "12px" }}
              ></i>
            </h1>
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
          <NavLink
            to="/dashboard/tutor"
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <div
              className="dcard-container"
              style={{ background: "var(--color-red)" }}
            >
              <h1>
                contribute{" "}
                <i
                  className="fa-solid fa-fire"
                  style={{ marginLeft: "12px" }}
                ></i>
              </h1>
              <p>
                Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
                sint cillum sint consectetur cupidatat.
              </p>
            </div>
          </NavLink>
        </div>

        <div
          className={
            isDashboardNavActive ? "chart-container-a" : "chart-container"
          }
        >
          <Line data={chartData} />
          <button className="cgpa-btn" onClick={() => CardFunc("gp")}>
            Edit <i className="fas fa-edit"></i>
          </button>
        </div>
        <TaskManager />
      </div>
      {overlayActive && (
        <div className="overlay" onClick={() => Reset()}>
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

          {gpTable && (
            <div className="cgpa-section">
              <div className="cgpa-header">
                <h1>CGPA Records</h1>
              </div>
              <div
                className="record-holder"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="gpa-container" style={{ marginBottom: "40px" }}>
                  <p>
                    <h4>Session</h4>
                    <input
                      type="string"
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                      placeholder="Session"
                    />
                    <h4>GPA</h4>
                    <input
                      type="number"
                      value={gpa}
                      onChange={(e) => setGPA(e.target.value)}
                      placeholder="GPA"
                    />
                    <i
                      onClick={() => addGPA()}
                      className="fa fa-plus"
                      style={{ color: "var(--color-green)" }}
                    ></i>
                  </p>
                </div>
                <div className="gpas-container">
                  {CGPADATA.map((data) => {
                    return (
                      <div className="gpa-container">
                        <p>
                          <h4>Session</h4> {data.session}
                          <h4>GPA</h4> {data.gpa}
                          <i
                            onClick={() => removeGPA(data.id)}
                            className="fa fa-times-circle"
                          ></i>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {isAddTaskFormOpen && (
            <div>
              <div
                className="task-form-container"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="ic">
                  <input
                    type="string"
                    placeholder="Task title"
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                  <input
                    type="time"
                    onChange={(e) => setTaskTime(e.target.value)}
                  />
                </div>
                <div
                  className="div-btn"
                  onClick={() => {
                    addTask({
                      title: taskTitle,
                      time: taskTime,
                      id: Math.random(),
                      status: false,
                    });
                    Reset();
                  }}
                >
                  ADD TASK
                </div>
              </div>
              <h1>Let's start</h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default index;
