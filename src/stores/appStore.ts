import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
}

interface AppState {
  sidebarCollapsed: boolean;
  accentColor: string;
  workHours: string;
  timezone: string;
  currentUser: User | null;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setAccentColor: (color: string) => void;
  setWorkHours: (hours: string) => void;
  setTimezone: (timezone: string) => void;
  setCurrentUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      accentColor: "#00ff66",
      workHours: "8",
      timezone: "UTC",
      currentUser: null,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setAccentColor: (color) => set({ accentColor: color }),
      setWorkHours: (hours) => set({ workHours: hours }),
      setTimezone: (timezone) => set({ timezone }),
      setCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: "bd-app-store",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        accentColor: state.accentColor,
        workHours: state.workHours,
        timezone: state.timezone,
      }),
    }
  )
);
