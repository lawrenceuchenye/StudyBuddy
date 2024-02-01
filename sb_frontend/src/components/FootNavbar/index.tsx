import "./index.css";
import { FC } from "react";

//@ts-ignore
const index: FC = () => {
  return (
    <div className="fn-main-container">
      <div className="fn-info-container">
        <div className="fn-links-container">
          <h1 tabindex="0">UseFul Links</h1>
          <h3 tabindex="0" role="link">
            Home
          </h3>
          <h3 tabindex="0" role="link">
            Resources
          </h3>
          <h3 tabindex="0" role="link">
            Contact Us
          </h3>
        </div>
        <div tabindex="0" className="fn-logo-container">
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
        <p tabindex="0">
          made with <i className="fa-brands fa-react"></i> and{" "}
          <i className="fa fa-heart"></i> studybud team.
        </p>
      </div>
    </div>
  );
};

export default index;
