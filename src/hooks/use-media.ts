"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * matchMedia as a React external store. Returns `undefined` during SSR and
 * the first client render (before hydration effects), so callers can render
 * a CSS-only fallback until the real value is known.
 */
export function useMedia(query: string): boolean | undefined {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => undefined,
  );
}
