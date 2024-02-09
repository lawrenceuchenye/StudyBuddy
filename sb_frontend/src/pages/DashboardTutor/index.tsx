import "./index.css";
import DashboardNavbar from "../../components/DashboardNavbar/";
import { FC, useState, useEffect } from "react";
import { useStudyBudStore } from "../../store/";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const index: FC = () => {
  const isDashboardNavActive = useStudyBudStore(
    (state) => state.isDashboardNavActive,
  );
  const [value, setValue] = useState("");
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
        <div className="editor-main-container">
          <div className="editor-container">
            <input type="text" placeholder="title" />
            <ReactQuill
              className="editor"
              theme="snow"
              value={value}
              onChange={setValue}
            />
          </div>
          <div className="article-main-container">
            <div className="article-header">
              <h1>Article</h1>
            </div>
            <div className="article-parts">
              <p>write a master piece to education minds.</p>
            </div>
            <button>PUBLISH</button>
          </div>
          <p>{value}</p>
        </div>
        <div className="pub-articles-main-container">
          <div className="article-header">
            <h1>Published Article</h1>
          </div>
          <div className="article-parts">
            <p>no articles published yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
