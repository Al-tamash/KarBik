"use client";

/**
 * The contact form. Same API, field ids and honeypot as before; only the surface changed.
 * It shows "Message sent!" only when /api/contact says it sent, and the API's own error
 * text otherwise (never a fake success).
 */

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY } from "@/lib/lead-routing";

const EMPTY = { name: "", email: "", subject: "", message: "", website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          topic: form.subject,
          message: form.message,
          website: form.website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(
          data.message || `We could not send your message. Please email ${SUPPORT_EMAIL} or WhatsApp ${SUPPORT_PHONE_DISPLAY}.`,
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setError(`Network problem. Check your connection and try again, or email ${SUPPORT_EMAIL}.`);
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div role="status" className="max-w-md">
        <p className="flex items-center gap-2 text-lg font-semibold text-ink-strong">
          <CheckCircle2 className="h-5 w-5 text-ink-muted" aria-hidden />
          Message sent!
        </p>
        <p className="mt-1 text-base text-ink-muted">Thank you. Your message has been sent to KarBik support.</p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setForm(EMPTY);
          }}
          className="mt-3 inline-flex min-h-11 cursor-pointer items-center font-semibold text-primary-600 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="label">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-topic" className="label">
          Topic
        </label>
        <select
          id="contact-topic"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="input cursor-pointer"
        >
          <option value="">Select a topic</option>
          <option value="buying">Buying a car</option>
          <option value="selling">Listing a car (dealer)</option>
          <option value="subscription">Plans and billing</option>
          <option value="report">Report a listing</option>
          <option value="partnership">Partnership</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="label">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="input resize-y"
        />
      </div>

      {/* Honeypot: hidden from people, bots tend to fill it. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>

      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      <button type="submit" disabled={sending} className="btn btn-primary btn-md cursor-pointer disabled:opacity-60">
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
