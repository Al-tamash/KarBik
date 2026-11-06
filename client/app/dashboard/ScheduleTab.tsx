"use client";

import { Calendar, Clock, Car, Phone, MessageSquare } from "lucide-react";
import type { ApiInquiry } from "@/lib/api-types";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
}

export default function ScheduleTab({ inquiries }: { inquiries: ApiInquiry[] }) {
  const followUps = inquiries
    .filter(inq => inq.followUpAt)
    .sort((a, b) => new Date(a.followUpAt!).getTime() - new Date(b.followUpAt!).getTime());

  const overdue = followUps.filter(inq => isOverdue(inq.followUpAt));
  const todayList = followUps.filter(inq => isToday(inq.followUpAt));
  const upcoming = followUps.filter(inq => !isOverdue(inq.followUpAt) && !isToday(inq.followUpAt));

  const testDrives = inquiries
    .filter(inq => inq.status === "test_drive")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (followUps.length === 0 && testDrives.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-6 h-6 text-ink-subtle" />
        </div>
        <h3 className="text-base font-bold text-ink-strong mb-1">No scheduled events</h3>
        <p className="text-sm text-ink-muted">Set follow-up dates on leads to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-danger-600 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Overdue ({overdue.length})
          </h3>
          <div className="space-y-3">
            {overdue.map(inq => (
              <div key={inq.id} className="card p-4 border-l-4 border-l-danger-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-strong">{inq.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {inq.phone}
                    </p>
                    {inq.car && (
                      <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                        <Car className="w-3 h-3" /> {inq.car.title}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-danger-600">{formatDate(inq.followUpAt)}</p>
                    <p className="text-xs text-ink-subtle">{formatTime(inq.followUpAt)}</p>
                  </div>
                </div>
                {inq.notes && (
                  <p className="text-xs text-ink-muted mt-2 p-2 bg-surface-alt rounded-lg">{inq.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today */}
      {todayList.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-primary-600 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Today ({todayList.length})
          </h3>
          <div className="space-y-3">
            {todayList.map(inq => (
              /* Unified accent border to brand core shade border-l-primary-600 */
              <div key={inq.id} className="card p-4 border-l-4 border-l-primary-600">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-strong">{inq.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {inq.phone}
                    </p>
                    {inq.car && (
                      <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                        <Car className="w-3 h-3" /> {inq.car.title}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-primary-600">Today</p>
                    <p className="text-xs text-ink-subtle">{formatTime(inq.followUpAt)}</p>
                  </div>
                </div>
                {inq.notes && (
                  <p className="text-xs text-ink-muted mt-2 p-2 bg-surface-alt rounded-lg">{inq.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-ink-strong mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming ({upcoming.length})
          </h3>
          <div className="space-y-3">
            {upcoming.map(inq => (
              <div key={inq.id} className="card p-4 border-l-4 border-l-border-strong">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-strong">{inq.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {inq.phone}
                    </p>
                    {inq.car && (
                      <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                        <Car className="w-3 h-3" /> {inq.car.title}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-ink">{formatDate(inq.followUpAt)}</p>
                    <p className="text-xs text-ink-subtle">{formatTime(inq.followUpAt)}</p>
                  </div>
                </div>
                {inq.notes && (
                  <p className="text-xs text-ink-muted mt-2 p-2 bg-surface-alt rounded-lg">{inq.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Drives */}
      {testDrives.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-success-600 mb-3 flex items-center gap-2">
            <Car className="w-4 h-4" /> Test Drives ({testDrives.length})
          </h3>
          <div className="space-y-3">
            {testDrives.map(inq => (
              <div key={inq.id} className="card p-4 border-l-4 border-l-success-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-strong">{inq.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {inq.phone}
                    </p>
                    {inq.car && (
                      <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                        <Car className="w-3 h-3" /> {inq.car.title}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="badge badge-success text-xs">Scheduled</span>
                    <p className="text-xs text-ink-subtle mt-1">{formatDate(inq.createdAt)}</p>
                  </div>
                </div>
                {inq.message && (
                  <p className="text-xs text-ink-muted mt-2 p-2 bg-surface-alt rounded-lg flex items-start gap-1">
                    <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" /> {inq.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
