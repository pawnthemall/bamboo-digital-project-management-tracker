"use client";

import { useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useTasks } from "@/hooks/useTasks";
import { useRouter } from "next/navigation";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarPage() {
  const { data: tasks, isLoading } = useTasks();
  const router = useRouter();

  const events = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((t) => t.dueDate || t.startDate)
      .map((task) => ({
        id: task.id,
        title: task.title,
        start: task.dueDate ? new Date(task.dueDate) : new Date(task.startDate!),
        end: task.dueDate ? new Date(task.dueDate) : new Date(task.startDate!),
        resource: task,
      }));
  }, [tasks]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventStyleGetter = (event: any) => {
    const task = event.resource as { priority: string; project: { color: string } };
    const backgroundColor = task.project.color;
    const isOverdue = task.priority === "HIGH";
    return {
      style: {
        backgroundColor,
        color: "#0a0a0a",
        border: isOverdue ? "2px solid #ef4444" : "none",
        borderRadius: 0,
        fontSize: "11px",
        fontWeight: "bold",
        fontFamily: "monospace",
      },
    };
  };

  if (isLoading) return <div className="text-muted text-sm">Loading calendar...</div>;

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => router.push(`/tasks/${event.id}`)}
        views={["month", "week", "day"]}
        defaultView="month"
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
}

function CustomToolbar({ label, onView, onNavigate, view }: { label: string; onView: (v: string) => void; onNavigate: (n: string) => void; view: string }) {
  const btn = (v: string) =>
    `text-xs px-2 py-1 border border-border ${view === v ? "bg-accent-green text-background" : "bg-surface text-foreground hover:border-accent-green"}`;
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate("PREV")} className="text-xs px-2 py-1 border border-border bg-surface hover:border-accent-green">&lt;</button>
        <button onClick={() => onNavigate("TODAY")} className="text-xs px-2 py-1 border border-border bg-surface hover:border-accent-green">TODAY</button>
        <button onClick={() => onNavigate("NEXT")} className="text-xs px-2 py-1 border border-border bg-surface hover:border-accent-green">&gt;</button>
        <span className="text-sm font-bold text-foreground ml-2">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {["month", "week", "day"].map((v) => (
          <button key={v} onClick={() => onView(v)} className={btn(v)}>
            {v.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
