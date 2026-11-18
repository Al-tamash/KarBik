"use client";

/**
 * Read-only list of what admins did (the latest 100 rows of admin_audit_log). It says so plainly
 * when the table does not exist yet (migration 0005 not applied), instead of an empty list that
 * would look like "nobody did anything".
 */

import React from "react";

export interface AuditEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  summary: string;
  note: string;
  createdAt: string;
}

export default function AdminActivityTab({
  entries,
  ready,
  loading,
}: {
  entries: AuditEntry[];
  ready: boolean | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <p role="status" className="py-10 text-sm text-ink-muted">
        Loading activity…
      </p>
    );
  }
  if (ready === false) {
    return (
      <p role="status" className="max-w-2xl py-10 text-base text-ink-muted">
        The audit log is not set up yet, so nothing is being recorded. Apply database migration 0005 to start. Until then
        giving or ending a plan is switched off.
      </p>
    );
  }
  if (ready === null) {
    return (
      <p role="alert" className="max-w-2xl py-10 text-base text-ink-muted">
        The activity did not load. Press Refresh to try again.
      </p>
    );
  }
  if (entries.length === 0) {
    return <p className="py-10 text-base text-ink-muted">Nothing recorded yet.</p>;
  }
  return (
    <ul className="divide-y divide-border border-y border-border">
      {entries.map((e) => (
        <li key={e.id} className="py-3">
          <p className="text-base text-ink-strong">{e.summary}</p>
          {e.note && <p className="mt-0.5 text-sm text-ink-muted">Note: {e.note}</p>}
          <p className="mt-0.5 text-sm text-ink-muted tabular-nums">
            {e.actorEmail || "An admin"} ·{" "}
            {new Date(e.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
