import "./index.css";
import { FC } from "react";

type TaskProp = {
  title: string;
  time: string;
};
const index: FC<TaskProp> = ({ title, time }) => {
  return (
    <div className="main-task-container">
      <h2>{title}</h2>
      <div className="utils-container">
        <p>
          {time} <i className="fa-solid fa-clock"></i>
        </p>
        <div className="icons">
          <i className="fas fa-edit"></i>
          <i className="fa fa-trash"></i>
          <i className="fa fa-check"></i>
        </div>
      </div>
    </div>
  );
};

export default index;
