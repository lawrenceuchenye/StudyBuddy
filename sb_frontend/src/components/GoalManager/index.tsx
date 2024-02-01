import "./index.css";
import Task from "../Task";
import { FC } from "react";

type TaskProp = {
  title: string;
  time: string;
};

type TaskMProps = {
  Tasks: TaskProp[];
};

const index: FC<TaskMProps> = ({ Tasks }) => {
  return (
    <div className="goal-manager-container">
      <div className="goal-manager-header">
        <h1>Goals Manager</h1>
        <div className="add-task-btn">
          <i className="fa fa-plus"></i>
        </div>
      </div>
      <div className={!Task ? "tasks-container" : "tasks-container-a"}>
        {!Tasks ? (
          <p>Long terms goals provide the best value</p>
        ) : (
          <>
            {Tasks.map((task) => {
              return <Task title={task.title} time={task.time} />;
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default index;
