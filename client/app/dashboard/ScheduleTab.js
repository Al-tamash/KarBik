"use client";

import { Calendar, Clock, Car, Phone, MessageSquare } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
}

export default function ScheduleTab({ inquiries }) {
  const followUps = inquiries
    .filter(inq => inq.followUpAt)
    .sort((a, b) => new Date(a.followUpAt) - new Date(b.followUpAt));

  const overdue = followUps.filter(inq => isOverdue(inq.followUpAt));
  const todayList = followUps.filter(inq => isToday(inq.followUpAt));
  const upcoming = followUps.filter(inq => !isOverdue(inq.followUpAt) && !isToday(inq.followUpAt));

  const testDrives = inquiries
    .filter(inq => inq.status === "test_drive")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (followUps.length === 0 && testDrives.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-6 h-6 text-neutral-400" />
        </div>
        <h3 className="text-base font-bold text-neutral-900 mb-1">No scheduled events</h3>
        <p className="text-sm text-neutral-500">Set follow-up dates on leads to see them here.</p>
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
              <div key={inq._id} className="card p-4 border-l-4 border-l-danger-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{inq.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
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
                    <p className="text-xs text-neutral-400">{formatTime(inq.followUpAt)}</p>
                  </div>
                </div>
                {inq.notes && (
                  <p className="text-xs text-neutral-500 mt-2 p-2 bg-neutral-50 rounded-lg">{inq.notes}</p>
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
              <div key={inq._id} className="card p-4 border-l-4 border-l-primary-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{inq.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
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
                    <p className="text-xs text-neutral-400">{formatTime(inq.followUpAt)}</p>
                  </div>
                </div>
                {inq.notes && (
                  <p className="text-xs text-neutral-500 mt-2 p-2 bg-neutral-50 rounded-lg">{inq.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming ({upcoming.length})
          </h3>
          <div className="space-y-3">
            {upcoming.map(inq => (
              <div key={inq._id} className="card p-4 border-l-4 border-l-neutral-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{inq.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {inq.phone}
                    </p>
                    {inq.car && (
                      <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                        <Car className="w-3 h-3" /> {inq.car.title}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-neutral-700">{formatDate(inq.followUpAt)}</p>
                    <p className="text-xs text-neutral-400">{formatTime(inq.followUpAt)}</p>
                  </div>
                </div>
                {inq.notes && (
                  <p className="text-xs text-neutral-500 mt-2 p-2 bg-neutral-50 rounded-lg">{inq.notes}</p>
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
              <div key={inq._id} className="card p-4 border-l-4 border-l-success-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{inq.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
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
                    <p className="text-xs text-neutral-400 mt-1">{formatDate(inq.createdAt)}</p>
                  </div>
                </div>
                {inq.message && (
                  <p className="text-xs text-neutral-500 mt-2 p-2 bg-neutral-50 rounded-lg flex items-start gap-1">
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
