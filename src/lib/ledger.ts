import { prisma } from "./prisma";
import type { LedgerEventType } from "@/types";

interface CreateLedgerEventParams {
  eventType: LedgerEventType;
  entityType: string;
  entityId?: string;
  projectId?: string;
  taskId?: string;
  oldValue?: string;
  newValue?: string;
  durationSeconds?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export async function createLedgerEvent(params: CreateLedgerEventParams) {
  return prisma.activityLedger.create({
    data: {
      eventType: params.eventType,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      projectId: params.projectId ?? null,
      taskId: params.taskId ?? null,
      oldValue: params.oldValue ?? null,
      newValue: params.newValue ?? null,
      durationSeconds: params.durationSeconds ?? null,
      notes: params.notes ?? null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
