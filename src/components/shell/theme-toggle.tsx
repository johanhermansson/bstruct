"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@neondatabase/auth/react/ui";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes only knows the real theme after hydration; render a neutral
  // placeholder until then to avoid a server/client mismatch.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const dark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm shadow-sm transition-colors hover:bg-surface-muted"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {mounted ? (dark ? "☀️" : "🌙") : "…"}
    </button>
  );
}
