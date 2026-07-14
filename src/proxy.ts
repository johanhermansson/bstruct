import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/server";

// Next 16 renamed middleware.ts to proxy.ts (Node.js runtime).
// Neon Auth redirects unauthenticated requests to the sign-in view.
const requireSession = auth.middleware({ loginUrl: "/auth/sign-in" });

/**
 * Only guard GET/HEAD navigations, never mutations.
 *
 * Neon Auth's middleware (0.4.2-beta) verifies the session by forwarding the
 * incoming request verbatim to its `get-session` endpoint, which only answers
 * GET. A POST — i.e. every server action — is forwarded as a POST, the
 * lookup fails, the request is treated as signed-out, and the action is
 * 307-redirected to the sign-in page. The client then receives HTML instead
 * of an action response, so every mutation dies with "an unexpected response
 * was received from the server" even for signed-in users.
 *
 * Skipping the middleware for non-GET requests is safe: every server action
 * starts with requireUser() (which 401s/redirects properly at the action
 * layer) and /api/positions checks the session itself.
 */
export default function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }
  return requireSession(request);
}

export const config = {
  matcher: [
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
