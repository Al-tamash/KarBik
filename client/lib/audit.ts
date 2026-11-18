import { db } from "@/lib/db";
import { adminAuditLog } from "@/lib/db/schema";
import { ApiError } from "@/lib/guards";

/**
 * The admin audit log: who did what to whom, and why. Every admin mutation writes one row.
 *
 * Two flavours, because the table comes from migration 0005 and the code can be deployed before
 * the migration is applied:
 *  - recordAdminAction: best effort. A failed write is logged and the admin's action goes on.
 *  - recordAdminActionStrict / auditInsert + db.batch: the action must not happen without a record
 *    (money-like actions such as giving a plan). They answer 503 when the table is missing.
 */

export type AuditTarget = "dealer" | "car" | "lead" | "loan" | "plan";

export type AuditEntry = {
  action: string;
  targetType: AuditTarget;
  targetId: string;
  /** One short line: what happened, in words the admin would use. */
  summary: string;
  /** The admin's own reason or reference (for example a UPI reference). */
  note?: string;
  metadata?: Record<string, unknown>;
};

export type AuditActor = { id: string; email: string };

function toRow(actor: AuditActor, entry: AuditEntry) {
  return {
    actor: actor.id,
    actorEmail: actor.email,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    summary: entry.summary.slice(0, 300),
    note: (entry.note ?? "").slice(0, 1000),
    metadata: entry.metadata ?? {},
  };
}

/** Postgres "undefined_table" (42P01): the log table does not exist, so migration 0005 is missing. */
export function isMissingAuditTable(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string }; message?: string } | null;
  if (!e) return false;
  return (
    e.code === "42P01" ||
    e.cause?.code === "42P01" ||
    /admin_audit_log.*does not exist|relation "admin_audit_log"/i.test(e.message ?? "")
  );
}

/** The 503 the admin sees when an action needs the log and the table is missing. */
export const AUDIT_NOT_READY = new ApiError(
  503,
  "The audit log is not set up yet, so this action is switched off. Apply database migration 0005 first."
);

/** Turns a failed write into the right error: "not set up" only when the table is really missing. */
export function auditWriteError(err: unknown): ApiError {
  if (isMissingAuditTable(err)) return new ApiError(AUDIT_NOT_READY.status, AUDIT_NOT_READY.message);
  return new ApiError(503, "The audit log could not be written just now. Nothing was changed. Try again.");
}

/** A prepared insert, for db.batch([...]) so the record and the change succeed or fail together. */
export function auditInsert(actor: AuditActor, entry: AuditEntry) {
  return db.insert(adminAuditLog).values(toRow(actor, entry));
}

export async function recordAdminAction(actor: AuditActor, entry: AuditEntry): Promise<void> {
  try {
    await db.insert(adminAuditLog).values(toRow(actor, entry));
  } catch (err) {
    console.error("Admin audit log write failed (is migration 0005 applied?):", err);
  }
}

export async function recordAdminActionStrict(actor: AuditActor, entry: AuditEntry): Promise<void> {
  try {
    await db.insert(adminAuditLog).values(toRow(actor, entry));
  } catch (err) {
    console.error("Admin audit log write failed:", err);
    throw auditWriteError(err);
  }
}
