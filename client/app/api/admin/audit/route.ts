import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminAuditLog } from "@/lib/db/schema";
import { apiHandler, requireAdmin } from "@/lib/guards";
import { isMissingAuditTable } from "@/lib/audit";

/**
 * GET /api/admin/audit — the latest admin actions (read only).
 *
 * `ready: false` means the table does not exist yet (migration 0005 not applied); the admin
 * page says so instead of showing an empty list that looks like "nothing happened". Any other
 * database error is a real error and is not turned into "not set up".
 */
export async function GET() {
  return apiHandler(async () => {
    await requireAdmin();
    try {
      const entries = await db
        .select()
        .from(adminAuditLog)
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(100);
      return { ready: true, entries };
    } catch (err) {
      if (isMissingAuditTable(err)) return { ready: false, entries: [] };
      throw err;
    }
  });
}
