"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/ToastProvider";
import {
  Bell, Shield, Key, Eye, EyeOff, Save, Check, X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { data: session, isPending } = authClient.useSession();

  const [activeSection, setActiveSection] = useState("notifications");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    emailInquiries: true,
    emailLeads: true,
    pushInquiries: true,
    pushFollowUps: true,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
      </div>
    );
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        addToast("Password updated successfully", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        addToast(data.message || "Failed to update password", "error");
      }
    } catch (err) {
      addToast("Network error", "error");
    }
    setPasswordLoading(false);
  }

  async function handleNotificationSave() {
    setSavingNotifications(true);
    try {
      const res = await fetch(`${API}/api/dealers/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(notifications),
      });
      if (res.ok) {
        addToast("Notification preferences saved", "success");
      } else {
        addToast("Failed to save preferences", "error");
      }
    } catch (err) {
      addToast("Network error", "error");
    }
    setSavingNotifications(false);
  }

  const sections = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "password", label: "Password", icon: Key },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Settings</h1>
      <p className="text-sm text-neutral-500 mb-8">Manage your account preferences and security.</p>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "notifications" && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Email — New inquiries</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Get notified when a buyer sends an inquiry</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.emailInquiries}
                    onChange={(v) => setNotifications({ ...notifications, emailInquiries: v })}
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Email — New leads</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Get notified about new buyer leads</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.emailLeads}
                    onChange={(v) => setNotifications({ ...notifications, emailLeads: v })}
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Push — Inquiries</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Browser push notifications for new inquiries</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.pushInquiries}
                    onChange={(v) => setNotifications({ ...notifications, pushInquiries: v })}
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Push — Follow-ups</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Reminders for scheduled follow-ups</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.pushFollowUps}
                    onChange={(v) => setNotifications({ ...notifications, pushFollowUps: v })}
                  />
                </label>
              </div>

              <button
                onClick={handleNotificationSave}
                disabled={savingNotifications}
                className="btn-md btn-primary mt-6 inline-flex items-center gap-2"
              >
                {savingNotifications ? "Saving..." : <><Save className="w-4 h-4" /> Save Preferences</>}
              </button>
            </div>
          )}

          {activeSection === "security" && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-6">Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Two-factor authentication</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Add an extra layer of security to your account</p>
                  </div>
                  <span className="badge badge-neutral text-xs">Coming soon</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Active sessions</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Manage devices logged into your account</p>
                  </div>
                  <span className="badge badge-neutral text-xs">Coming soon</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "password" && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-6">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="label">Current password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      className="input pr-10"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">New password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      className="input pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="helper-text">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="label">Confirm new password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="input pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-md btn-primary inline-flex items-center gap-2"
                >
                  {passwordLoading ? "Updating..." : <><Key className="w-4 h-4" /> Update Password</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-primary-600" : "bg-neutral-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
