"use client";

import { authClient } from "@/lib/auth/client";

/**
 * When the session expires, the auth proxy 307-redirects server-action POSTs
 * to /auth/sign-in, so the client receives the sign-in page's HTML instead of
 * an action response and rejects with a generic "unexpected response" error —
 * while the app shell still looks signed in. Every mutation goes through this
 * wrapper so that failure mode leaves the app instead of failing silently.
 */
export async function runAction<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (await isSignedOut()) {
      redirectToSignIn();
      // The page is navigating away; never settle so callers don't flash
      // error state or roll back optimistic UI during the unload.
      return new Promise<never>(() => {});
    }
    throw error;
  }
}

async function isSignedOut(): Promise<boolean> {
  try {
    // /api/auth is outside the proxy matcher, so this works while logged out.
    const { data, error } = await authClient.getSession();
    return !error && !data?.user;
  } catch {
    // Can't reach the auth API (offline?) — treat as a regular error.
    return false;
  }
}

let redirecting = false;

function redirectToSignIn() {
  if (redirecting) return;
  redirecting = true;
  // Full navigation, not router.push: the RSC shell above us was rendered
  // with a valid session and must be thrown away, and the proxy will keep
  // unauthenticated visitors on the sign-in view.
  window.location.assign("/auth/sign-in");
}
