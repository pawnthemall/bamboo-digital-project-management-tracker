"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TimerState {
  taskId: string;
  entryId: string;
  startTime: number;
  pausedSeconds: number;
  isRunning: boolean;
}

const STORAGE_KEY = "bd-timer-state";

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getInitialState() {
  if (typeof window === "undefined") {
    return { elapsed: 0, isRunning: false, activeTaskId: null, activeEntryId: null, state: null };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { elapsed: 0, isRunning: false, activeTaskId: null, activeEntryId: null, state: null };
  }
  try {
    const state: TimerState = JSON.parse(raw);
    if (state.isRunning && state.startTime) {
      const now = Date.now();
      const elapsedSec = Math.floor((now - state.startTime) / 1000) - state.pausedSeconds;
      return {
        elapsed: Math.max(0, elapsedSec),
        isRunning: true,
        activeTaskId: state.taskId,
        activeEntryId: state.entryId,
        state,
      };
    }
    return { elapsed: 0, isRunning: false, activeTaskId: null, activeEntryId: null, state: null };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { elapsed: 0, isRunning: false, activeTaskId: null, activeEntryId: null, state: null };
  }
}

export function useTaskTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<TimerState | null>(null);
  const initial = getInitialState();
  stateRef.current = initial.state;

  const [elapsed, setElapsed] = useState(initial.elapsed);
  const [isRunning, setIsRunning] = useState(initial.isRunning);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(initial.activeTaskId);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(initial.activeEntryId);

  // Resume ticking if the timer was restored from localStorage
  useEffect(() => {
    if (stateRef.current && isRunning) {
      startTicking(stateRef.current.startTime, stateRef.current.pausedSeconds);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  function startTicking(startTime: number, pausedSeconds: number) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const sec = Math.floor((now - startTime) / 1000) - pausedSeconds;
      setElapsed(Math.max(0, sec));
    }, 1000);
  }

  function saveState(state: TimerState) {
    stateRef.current = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function clearState() {
    stateRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  const start = useCallback(async (taskId: string) => {
    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", taskId }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const startTime = Date.now();
      const state: TimerState = {
        taskId,
        entryId: data.entry.id,
        startTime,
        pausedSeconds: 0,
        isRunning: true,
      };
      saveState(state);
      setActiveTaskId(taskId);
      setActiveEntryId(data.entry.id);
      setIsRunning(true);
      setElapsed(0);
      startTicking(startTime, 0);
      return true;
    } catch {
      return false;
    }
  }, []);

  const pause = useCallback(async () => {
    if (!stateRef.current) return false;
    const state = stateRef.current;
    const now = Date.now();
    const currentElapsed = Math.floor((now - state.startTime) / 1000);
    const newPaused = state.pausedSeconds + currentElapsed;

    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pause", taskId: state.taskId, entryId: state.entryId, pausedSeconds: newPaused }),
      });
      if (!res.ok) return false;

      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      saveState({ ...state, isRunning: false, pausedSeconds: newPaused });
      return true;
    } catch {
      return false;
    }
  }, []);

  const resume = useCallback(async () => {
    if (!stateRef.current) return false;
    const state = stateRef.current;
    const startTime = Date.now();

    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resume", taskId: state.taskId, entryId: state.entryId }),
      });
      if (!res.ok) return false;
      const data = await res.json();

      const newState: TimerState = {
        taskId: state.taskId,
        entryId: data.entry.id,
        startTime,
        pausedSeconds: state.pausedSeconds,
        isRunning: true,
      };
      saveState(newState);
      setActiveEntryId(data.entry.id);
      setIsRunning(true);
      startTicking(startTime, state.pausedSeconds);
      return true;
    } catch {
      return false;
    }
  }, []);

  const stop = useCallback(async () => {
    if (!stateRef.current) return null;
    const state = stateRef.current;
    const now = Date.now();
    const currentElapsed = Math.floor((now - state.startTime) / 1000);
    const totalPaused = state.pausedSeconds + currentElapsed;

    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop", taskId: state.taskId, entryId: state.entryId, pausedSeconds: totalPaused }),
      });
      if (!res.ok) return null;
      const data = await res.json();

      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      setElapsed(data.totalSeconds);
      clearState();
      setActiveTaskId(null);
      setActiveEntryId(null);
      return data.totalSeconds;
    } catch {
      return null;
    }
  }, []);

  const complete = useCallback(async () => {
    if (!stateRef.current) return null;
    const state = stateRef.current;
    const now = Date.now();
    const currentElapsed = Math.floor((now - state.startTime) / 1000);
    const totalPaused = state.pausedSeconds + currentElapsed;

    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", taskId: state.taskId, entryId: state.entryId, pausedSeconds: totalPaused }),
      });
      if (!res.ok) return null;
      const data = await res.json();

      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      setElapsed(data.totalSeconds);
      clearState();
      setActiveTaskId(null);
      setActiveEntryId(null);
      return data.totalSeconds;
    } catch {
      return null;
    }
  }, []);

  const formatted = formatTime(elapsed);

  return {
    elapsed,
    formatted,
    isRunning,
    activeTaskId,
    activeEntryId,
    start,
    pause,
    resume,
    stop,
    complete,
  };
}
