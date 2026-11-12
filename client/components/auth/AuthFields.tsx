"use client";

/**
 * The fields every KarBik sign-in or sign-up asks for, in one place: used by the
 * /login and /register pages and by the lead sheet on the car and compare pages, so a
 * buyer meets the same form, labels and rules everywhere.
 */

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cleanMobileInput } from "@/lib/car-format";

export type AuthValues = { name: string; phone: string; email: string; password: string };
export const EMPTY_AUTH: AuthValues = { name: "", phone: "", email: "", password: "" };

/* A revealed password is plain text: stop the phone keyboard "fixing" it. */
const NO_AUTOFIX = { autoCapitalize: "none", autoCorrect: "off", spellCheck: false } as const;

export function PasswordField({
  id,
  label = "Password",
  value,
  onChange,
  autoComplete,
  minLength,
  maxLength = 128,
  placeholder,
  labelRight,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  /** e.g. a "Forgot password?" link, set on the label's line. */
  labelRight?: React.ReactNode;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input pr-12"
          required
          {...NO_AUTOFIX}
        />
        {/* A fixed name with aria-pressed: "Show password, toggle button, pressed" */}
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label="Show password"
          aria-pressed={shown}
          className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-ink-muted hover:text-ink"
        >
          {shown ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

export default function AuthFields({
  mode,
  values,
  onChange,
  idPrefix,
  forgotHref,
  phoneInvalid = false,
}: {
  mode: "signin" | "signup";
  values: AuthValues;
  onChange: (patch: Partial<AuthValues>) => void;
  /** Ids become `${idPrefix}-name`, `-phone`, `-email`, `-password`. */
  idPrefix: string;
  /** Sign-in only: where "Forgot password?" goes. Omit to hide it. */
  forgotHref?: string;
  /** The page's error is about the mobile number: mark it and point the field at the message. */
  phoneInvalid?: boolean;
}) {
  return (
    <>
      {mode === "signup" && (
        <>
          <div>
            <label htmlFor={`${idPrefix}-name`} className="label">
              Full name
            </label>
            <input
              id={`${idPrefix}-name`}
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={values.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-phone`} className="label">
              Mobile number
            </label>
            <input
              id={`${idPrefix}-phone`}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit mobile number"
              value={values.phone}
              onChange={(e) => onChange({ phone: cleanMobileInput(e.target.value) })}
              className={`input ${phoneInvalid ? "input-error" : ""}`}
              aria-invalid={phoneInvalid || undefined}
              aria-describedby={phoneInvalid ? "auth-error" : `${idPrefix}-phone-help`}
              required
            />
            <p id={`${idPrefix}-phone-help`} className="helper-text">
              KarBik support uses this to reach you about a car. No OTP.
            </p>
          </div>
        </>
      )}

      <div>
        <label htmlFor={`${idPrefix}-email`} className="label">
          Email
        </label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className="input"
          required
          {...NO_AUTOFIX}
        />
      </div>

      <PasswordField
        id={`${idPrefix}-password`}
        value={values.password}
        onChange={(password) => onChange({ password })}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        minLength={mode === "signup" ? 8 : undefined}
        placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
        labelRight={
          mode === "signin" && forgotHref ? (
            <a
              href={forgotHref}
              className="-my-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary-600 hover:underline"
            >
              Forgot password?
            </a>
          ) : undefined
        }
      />
    </>
  );
}
