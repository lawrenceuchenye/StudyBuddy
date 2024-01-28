import { create } from "zustand";

type StudyBudStoreProp = {
  isTapped: boolean;
  isDashboardNavActive: boolean;
  setIsTapped: () => void;
  toggleIsDashboardNavActive: () => void;
};

export const useStudyBudStore = create<StudyBudStoreProp>((set) => ({
  isTapped: false,
  isDashboardNavActive: false,
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
}));
