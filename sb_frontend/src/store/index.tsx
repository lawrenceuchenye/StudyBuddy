import { create } from "zustand";

type StudyBudStoreProp = {
  isTapped: boolean;
  setIsTapped: () => void;
};

export const useStudyBudStore = create<StudyBudStoreProp>((set) => ({
  isTapped: false,
  toggleIsTapped: () => {
    set((state) => ({
      isTapped: !state.isTapped,
    }));
  },
}));
