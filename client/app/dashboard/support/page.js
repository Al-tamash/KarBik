"use client";

import { Mail, Phone, MessageCircle, HelpCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Support</h1>
      <p className="text-sm text-neutral-500 mb-8">Need help? Our team is here for you.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <a
          href="mailto:support@autobazaar.com"
          className="card p-6 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Email Support</h3>
          <p className="text-xs text-neutral-500 mt-1">support@autobazaar.com</p>
          <p className="text-xs text-neutral-400 mt-2">Response within 24 hours</p>
        </a>

        <a
          href="tel:+911234567890"
          className="card p-6 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Phone Support</h3>
          <p className="text-xs text-neutral-500 mt-1">+91 12345 67890</p>
          <p className="text-xs text-neutral-400 mt-2">Mon-Sat, 9AM-6PM IST</p>
        </a>

        <a
          href="https://wa.me/911234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="card p-6 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center mb-4 group-hover:bg-success-100 transition-colors">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">WhatsApp</h3>
          <p className="text-xs text-neutral-500 mt-1">Quick responses</p>
          <p className="text-xs text-neutral-400 mt-2">Chat with our team instantly</p>
        </a>

        <div className="card p-6">
          <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center mb-4">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">FAQ</h3>
          <p className="text-xs text-neutral-500 mt-1">Common questions answered</p>
          <p className="text-xs text-neutral-400 mt-2">Browse our help center</p>
        </div>
      </div>

      <div className="card p-6 bg-primary-50 border-primary-200">
        <h3 className="text-sm font-bold text-primary-900 mb-2">Dealer Resources</h3>
        <p className="text-xs text-primary-700 mb-4">
          Learn how to maximize your listings and generate more leads.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Getting started guide →
          </a>
          <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Listing best practices →
          </a>
          <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Pricing plans explained →
          </a>
          <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            CRM tips for dealers →
          </a>
        </div>
      </div>
    </div>
  );
}
