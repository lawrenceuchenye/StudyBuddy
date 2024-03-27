import "./index.css";
import DashboardNavbar from "../../components/DashboardNavbar/";
import { FC, useState, useEffect } from "react";
import { useStudyBudStore } from "../../store/";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import UserProfile from "../../components/UserProfile/";

const index: FC = () => {
  const isDashboardNavActive = useStudyBudStore(
    (state) => state.isDashboardNavActive,
  );
  const [value, setValue] = useState("");
  const [width, setWidth] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setWidth(window.innerWidth);
    if (window.innerWidth < 720) {
      setIsMobile(true);
      return;
    }
  }, [window.innerWidth]);

  return (
    <div className="dashboard-main-container">
      <div
        className="dnav-container"
        style={{ width: `${isMobile ? `${width}px` : "auto"}` }}
      >
        <DashboardNavbar />
      </div>
      <div
        className={
          isDashboardNavActive
            ? "main-user-info-container-a"
            : "main-user-info-container"
        }
      >
        <UserProfile
          username={"DAVE JMAES"}
          uni_name={"MASSACHUSETTS INSTITUTE OF TECHNOLOGY(MIT)"}
          uni_address={"77 MASSACHUSETTS AVE"}
          level={"3RD YEAR - MECH. ENG."}
        />
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
              <p>write a master piece to educate minds.</p>
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
