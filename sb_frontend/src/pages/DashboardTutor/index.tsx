import "./index.css";
import DashboardNavbar from "../../components/DashboardNavbar/";
import { FC, useState } from "react";
import { useStudyBudStore } from "../../store/";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const index: FC = () => {
  const isDashboardNavActive = useStudyBudStore(
    (state) => state.isDashboardNavActive,
  );
  const [value, setValue] = useState('');



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
        <div>

          <div>
            <input type="text" placeholder="title" />
            <ReactQuill theme="snow" value={value} onChange={setValue} />
          </div>
          <div>
            <p>{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
