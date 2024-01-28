import "./index.css";
import { FC, useEffect } from "react";
import { useStudyBudStore } from "../../store/";

const index: FC = () => {
  const setIsTapped = useStudyBudStore((state) => state.setIsTapped);

  useEffect(() => {
    setIsTapped(false);
  }, []);

  return (
    <div className="form-auth-container">
      <div className="form-container">
        <div className="form-img-container">
          <h1>
            back for <span>more book</span> adventure
          </h1>
        </div>
        <div className="main-form-container">
          <h1>Let's grind</h1>
          <div className="form-fields-container">
            <input type="text" placeholder="@email address" />
            <input type="password" placeholder="password" />
            <button>Log in</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
