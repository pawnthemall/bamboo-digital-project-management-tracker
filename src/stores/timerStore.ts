import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimerState {
  activeTaskId: string | null;
  isRunning: boolean;
  startTime: number; // timestamp when timer started
  elapsedSeconds: number;
  setActiveTaskId: (id: string | null) => void;
  setIsRunning: (running: boolean) => void;
  setStartTime: (time: number) => void;
  setElapsedSeconds: (seconds: number) => void;
  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      activeTaskId: null,
      isRunning: false,
      startTime: 0,
      elapsedSeconds: 0,
      setActiveTaskId: (id) => set({ activeTaskId: id }),
      setIsRunning: (running) => set({ isRunning: running }),
      setStartTime: (time) => set({ startTime: time }),
      setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
      startTimer: (taskId) =>
        set({
          activeTaskId: taskId,
          isRunning: true,
          startTime: Date.now(),
          elapsedSeconds: 0,
        }),
      pauseTimer: () =>
        set((state) => {
          const now = Date.now();
          const additional = state.isRunning ? Math.floor((now - state.startTime) / 1000) : 0;
          return {
            isRunning: false,
            elapsedSeconds: state.elapsedSeconds + additional,
          };
        }),
      resumeTimer: () =>
        set({
          isRunning: true,
          startTime: Date.now(),
        }),
      stopTimer: () =>
        set({
          activeTaskId: null,
          isRunning: false,
          startTime: 0,
          elapsedSeconds: 0,
        }),
    }),
    {
      name: "bd-timer-store",
    }
  )
);
