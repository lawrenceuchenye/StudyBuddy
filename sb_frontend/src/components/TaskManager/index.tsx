import "./index.css";
import Task from "../Task";
import { useStudyBudStore } from "../../store";

import { FC, useEffect } from "react";

type TaskProp = {
  title: string;
  time: string;
};

type TaskMProps = {
  Tasks: TaskProp[];
};

const index: FC<TaskMProps> = () => {
  const overlayActive = useStudyBudStore((state) => state.overlayActive);
  const setOverlayActive = useStudyBudStore((state) => state.setOverlayActive);
  const tasks = useStudyBudStore((state) => state.Tasks);
  const setIsAddTaskFormOpen = useStudyBudStore(
    (state) => state.setIsAddTaskFormOpen,
  );

  useEffect(() => {
    console.log(tasks);
  }, [tasks]);
  return (
    <div className="task-manager-container">
      <div className="task-manager-header">
        <h1>Task Manager</h1>
        <div
          className="add-task-btn"
          onClick={() => {
            setOverlayActive(true);
            setIsAddTaskFormOpen(true);
          }}
        >
          <i className="fa fa-plus"></i>
        </div>
      </div>
      <div className={!Task ? "tasks-container" : "tasks-container-a"}>
        {!tasks[0] ? (
          <p>All tasks are deleted after 24 Hours.</p>
        ) : (
          <>
            {tasks.map((task) => {
              return <Task title={task.title} time={task.time} id={task.id} />;
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default index;
