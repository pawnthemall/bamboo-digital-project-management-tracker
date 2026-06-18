export type ProjectStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type LedgerEventType =
  | "USER_LOGGED_IN"
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_DELETED"
  | "TIMER_STARTED"
  | "TIMER_PAUSED"
  | "TIMER_RESUMED"
  | "TIMER_STOPPED"
  | "TIMER_COMPLETED"
  | "DURATION_EDITED"
  | "CHECKLIST_ITEM_COMPLETED";
