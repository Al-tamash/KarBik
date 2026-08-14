"use client";

/**
 * WHAT: Contact Us page for AutoBazaar.
 * WHY: Trust signal — buyers and dealers need a dedicated way to reach the team.
 *      A contact page with a working form and clear response time expectations
 *      builds confidence that there's a real team behind the platform.
 *      Also great for local SEO (Google uses contact info for local ranking).
 */

import { useState } from "react";
import Link from "next/link";
import {
  Mail, Phone, MapPin, Clock, Send,
  MessageSquare, Users, HelpCircle
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would POST to an API endpoint
    // For now, we show a success state to demonstrate the flow
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Page Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <span className="text-xs font-black text-primary-600 uppercase tracking-widest mb-3 block">
            Get in Touch
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-2">
            Contact Us
          </h1>
          <p className="text-sm text-neutral-500 max-w-lg">
            Have a question about a listing, need help with your dealer account, or want to partner with us? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ─── Left Column: Contact Info ─── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                <div className="p-2 rounded-xl bg-primary-50 border border-primary-100 shrink-0">
                  <Mail className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Email Support</h3>
                  <a href="mailto:support@autobazaar.in" className="text-sm text-primary-600 hover:underline mt-0.5 block">
                    support@autobazaar.in
                  </a>
                  <p className="text-xs text-neutral-500 mt-1">We respond within 24 hours on working days.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                <div className="p-2 rounded-xl bg-primary-50 border border-primary-100 shrink-0">
                  <Phone className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Phone Support</h3>
                  <a href="tel:18002886229" className="text-sm text-primary-600 hover:underline mt-0.5 block">
                    1800-AUTO-BAZAAR
                  </a>
                  <p className="text-xs text-neutral-500 mt-1">Toll-free, available Mon–Sat, 9 AM – 7 PM IST.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                <div className="p-2 rounded-xl bg-primary-50 border border-primary-100 shrink-0">
                  <MapPin className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Office Address</h3>
                  <p className="text-sm text-neutral-600 mt-0.5">
                    Viswash Nagar, Mehdipatnam,<br />
                    Hyderabad, Telangana 500028
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">Walk-ins by appointment only.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                <div className="p-2 rounded-xl bg-primary-50 border border-primary-100 shrink-0">
                  <Clock className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Business Hours</h3>
                  <p className="text-sm text-neutral-600 mt-0.5">Monday – Saturday: 9:00 AM – 7:00 PM</p>
                  <p className="text-sm text-neutral-600">Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Quick help links */}
            <div className="p-5 bg-neutral-100 rounded-2xl border border-neutral-200 mt-6">
              <h3 className="text-sm font-bold text-neutral-900 mb-3">Quick Help</h3>
              <div className="space-y-2">
                <Link href="/faq" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  <HelpCircle className="h-4 w-4" /> Frequently Asked Questions
                </Link>
                <Link href="/pricing" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  <Users className="h-4 w-4" /> Dealer Subscription Plans
                </Link>
                <Link href="/about" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors">
                  <MessageSquare className="h-4 w-4" /> About AutoBazaar
                </Link>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Contact Form ─── */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-1">Send us a message</h2>
              <p className="text-xs text-neutral-500 mb-6">
                Fill in the form below and we&apos;ll get back to you as soon as possible.
              </p>

              {submitted ? (
                <div className="text-center py-12 animate-scale-in">
                  <div className="h-14 w-14 mx-auto rounded-full bg-success-50 border border-success-100 flex items-center justify-center mb-4">
                    <Send className="h-6 w-6 text-success-600" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">Message Sent!</h3>
                  <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                    Thank you for reaching out. We&apos;ll respond to your inquiry within 24 hours on working days.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-6 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                      Subject
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select a topic</option>
                      <option value="buying">Buying a car</option>
                      <option value="selling">Listing a car (Dealer)</option>
                      <option value="subscription">Subscription & Billing</option>
                      <option value="report">Report a listing</option>
                      <option value="partnership">Partnership inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all resize-y"
                      placeholder="Describe your question or issue in detail..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
