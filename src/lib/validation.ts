import { z } from "zod";

export const emailSchema = z.string().trim().email("Invalid email address");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const projectStatusSchema = z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]);
export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(200, "Project name is too long"),
  description: z.string().trim().max(2000, "Description is too long").optional().nullable(),
  status: projectStatusSchema.optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex color like #00ff66").optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
  estimatedHours: z.number().min(0, "Estimated hours must be positive").optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  status: projectStatusSchema.optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  remainingHours: z.number().min(0).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200, "Task title is too long"),
  description: z.string().trim().max(2000, "Description is too long").optional().nullable(),
  projectId: z.string().cuid("Invalid project id"),
  category: z.string().trim().max(100).optional().nullable(),
  priority: taskPrioritySchema.optional().nullable(),
  status: taskStatusSchema.optional().nullable(),
  estimatedDuration: z.number().int().min(0, "Estimated duration must be a positive integer").optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
  checklist: z.array(z.string().trim().min(1, "Checklist item cannot be empty")).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(100).optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  estimatedDuration: z.number().int().min(0).optional(),
  actualDuration: z.number().int().min(0).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().cuid().optional(),
});

export const timerActionSchema = z.object({
  action: z.enum(["start", "pause", "resume", "stop", "complete"]),
  taskId: z.string().cuid("Invalid task id"),
  entryId: z.string().cuid().optional().nullable(),
  pausedSeconds: z.number().int().min(0).optional().nullable(),
});

export const checklistUpdateSchema = z.object({
  isCompleted: z.boolean(),
});

export const projectMemberSchema = z.object({
  userId: z.string().cuid("Invalid user id"),
  role: z.enum(["MEMBER", "MANAGER"]).optional(),
});

export const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
});

export const reportsQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).optional(),
});

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(body);
  return result;
}

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}
