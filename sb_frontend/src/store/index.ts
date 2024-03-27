import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type CGPADataPoint = {
  id: number;
  session: number;
  gpa: number;
  last_gpa?: number;
};

type Task = {
  id: number;
  title: string;
  time: string;
  status: boolean;
};

type StudyBudStoreProp = {
  isTapped: boolean;
  isDashboardNavActive: boolean;
  toggleIsTapped: () => void;
  setIsTapped: (boolVal: boolean) => void;
  toggleIsDashboardNavActive: () => void;
  CGPAData: CGPADataPoint[];
  Tasks: Task[];
  addTask: (taskObj: Task) => void;
  removeTask: (taskId: number) => void;
  addGPA: (GPA: CGPADataPoint) => void;
  removeGPA: (id: number) => void;
  overlayActive: boolean;
  setOverlayActive: (bool_state: boolean) => void;
  isAddTaskFormOpen: boolean;
  setIsAddTaskFormOpen: (boolVal: boolean) => void;
  activeDashboardPage: () => string;
  setActiveDashboardPage: (pageName: string) => void;
};

export const useStudyBudStore = create<StudyBudStoreProp>((set) => ({
  isTapped: false,
  isDashboardNavActive: false,
  activeDashboardPage: () => {
    if (localStorage) {
      return localStorage.getItem("activeDashboardPage");
    }
    return "Profile";
  },
  setActiveDashboardPage: (pageName) => {
    if (localStorage) {
      localStorage.setItem("activeDashboardPage", pageName);
    }
  },
  toggleIsTapped: () => {
    set((state) => ({
      isTapped: !state.isTapped,
    }));
  },
  setIsTapped: (boolVal) => {
    set({ isTapped: boolVal });
  },
  toggleIsDashboardNavActive: () => {
    set((state) => ({
      isDashboardNavActive: !state.isDashboardNavActive,
    }));
  },
  CGPAData: [
    {
      id: 0,
      session: "2019/2020",
      gpa: 0,
      last_gpa: 0,
    },

    {
      id: 0,
      session: "2020/2021",
      gpa: 3.8,
      last_gpa: 0,
    },
    { id: 1, session: "2021/2022", gpa: 3, last_gpa: 4.5 },
    {
      id: 2,
      session: "2022/2023",
      gpa: 4.5,
    },
    {
      id: 3,
      session: "2023/2024",
      gpa: 4,
      last_gpa: 3,
    },
  ],
  removeTask: (taskId) => {
    set((state) => ({
      Tasks: state.Tasks.filter((task) => task.id != taskId),
    }));
  },
  addTask: (taskObj) => {
    set((state) => ({ Tasks: [...state.Tasks, taskObj] }));
  },

  Tasks: [
    {
      title: "Study Calc 204",
      time: "3:40pm",
      id: 203,
    },
    {
      title: "Study Stats 240",
      time: "2:40pm",
      id: 120,
    },
  ],
  addGPA: (GPA) => {
    set((state) => ({
      CGPAData: [...state.CGPAData, GPA],
    }));
  },
  removeGPA: (id) => {
    set((state) => ({
      CGPAData: state.CGPAData.filter((data) => data.id != id),
    }));
  },
  isAddTaskFormOpen: false,
  setIsAddTaskFormOpen: (boolVal) => {
    set((state) => ({ isAddTaskFormOpen: boolVal }));
  },
  overlayActive: false,
  setOverlayActive: (bool_state) => {
    set((state) => ({ overlayActive: bool_state }));
  },
}));
