"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";

const COLUMNS = [
  { key: "TODO", label: "Backlog" },
  { key: "PLANNED", label: "Planned" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "REVIEW", label: "Review" },
  { key: "COMPLETED", label: "Completed" },
];

function priorityDot(priority: string) {
  switch (priority) {
    case "HIGH": return "text-accent-red";
    case "MEDIUM": return "text-accent-orange";
    case "LOW": return "text-accent-blue";
    default: return "text-muted";
  }
}

export default function BoardPage() {
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      setDraggingId(null);
      if (!result.destination) return;
      const sourceStatus = result.source.droppableId;
      const destStatus = result.destination.droppableId;
      if (sourceStatus === destStatus) return;

      const taskId = result.draggableId;
      updateTask.mutate({ id: taskId, body: { status: destStatus } });
    },
    [updateTask]
  );

  if (isLoading) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={(start) => setDraggingId(start.draggableId)}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {COLUMNS.map((col) => {
          const colTasks = (tasks || []).filter((t) => t.status === col.key);
          return (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`border border-border bg-surface p-3 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? "border-accent-green bg-surface-hover" : ""}`}
                >
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                    <h3 className="text-sm font-bold text-foreground">{col.label}</h3>
                    <span className="text-xs text-muted">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colTasks.map((task, index) => (
                      <Draggable draggableId={task.id} index={index} key={task.id}>
                        {(providedDraggable, draggableSnapshot) => (
                          <Link href={`/tasks/${task.id}`}>
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              className={`border bg-background p-2 transition-colors ${draggableSnapshot.isDragging ? "border-accent-green shadow-lg" : "border-border hover:border-accent-green"}`}
                              style={providedDraggable.draggableProps.style as React.CSSProperties}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs ${priorityDot(task.priority)}`}>●</span>
                                <span className="text-xs text-foreground font-bold truncate">{task.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2" style={{ backgroundColor: task.project.color }} />
                                <span className="text-xs text-muted truncate">{task.project.name}</span>
                              </div>
                            </div>
                          </Link>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
