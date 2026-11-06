"use client";

/**
 * ThemeToggle — tri-state light / dark / system switcher.
 *
 * Persists the choice under `ab-theme` and applies/removes the `dark` class
 * on <html>. The initial class is applied pre-paint by the anti-flash
 * bootstrap script in app/layout.tsx; this component only takes over after
 * mount, so there is no hydration mismatch (we render a placeholder until
 * mounted).
 */

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "ab-theme";

function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function storedTheme(): Theme {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : "system";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(storedTheme());
    setMounted(true);

    // Follow OS changes while in "system" mode.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (storedTheme() === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const cycle = () => {
    const next: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    setTheme(next);
  };

  if (!mounted) {
    return <span aria-hidden className="inline-block h-11 w-11 lg:h-9 lg:w-9" />;
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Colour theme: ${theme}. Click to switch`}
      title={`Theme: ${theme} (click to switch)`}
      className="btn btn-ghost btn-sm h-11 w-11 lg:h-9 lg:w-9 px-0!"
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}
