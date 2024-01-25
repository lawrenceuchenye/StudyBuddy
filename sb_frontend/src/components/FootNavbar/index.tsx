import "./index.css";
import { FC } from "react";

//@ts-ignore
const index: FC = () => {
  return (
    <div className="fn-main-container">
      <div className="fn-info-container">
        <div className="fn-links-container">
          <h1>UseFul Links</h1>
          <h3>Home</h3>
          <h3>Resources</h3>
          <h3>Contact Us</h3>
        </div>
        <div className="fn-logo-container">
          <i>
            <h1>
              <span>S</span>
              <span>B</span>
            </h1>
          </i>
        </div>
      </div>
      <hr />
      <div className="tc-container">
        <p>
          made with <i className="fa-brands fa-react"></i> and{" "}
          <i className="fa fa-heart"></i> studybud team.
        </p>
      </div>
    </div>
  );
};

export default index;
