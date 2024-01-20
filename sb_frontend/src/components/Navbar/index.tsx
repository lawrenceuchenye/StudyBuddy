import "./index.css";
import { FC, useState } from "react";
import { useStudyBudStore } from "../../store/";
//@ts-ignore
const index: FC = () => {
  //  const [isTapped, setIsTapped] = useState<boolean>(false);
  const isTapped = useStudyBudStore((state) => state.isTapped);
  const toggleIsTapped = useStudyBudStore((state) => state.toggleIsTapped);

  return (
    <div className="main-nav-container">
      <div className="logo-container">
        <i>
          <h1>
            <span>S</span>
            <span>B</span>
          </h1>
        </i>
      </div>
      <div className="nav-links-container">
        <h3>Home</h3>
        <h3>Resources</h3>
        <h3>About</h3>
      </div>
      <div className="auth-container">
        <button>
          <h3>
            Log in <i className="fa fa-sign-in"></i>
          </h3>{" "}
        </button>
        <button>
          <h3>
            Sign up <i className="fa fa-user-plus"></i>
          </h3>{" "}
        </button>
      </div>
      <div className="ham_parent_container" onClick={toggleIsTapped}>
        <div className={isTapped ? "ham_open" : "ham"}></div>
      </div>
    </div>
  );
};

export default index;
