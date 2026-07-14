import { auth } from "@/lib/auth/server";

// Next 16 renamed middleware.ts to proxy.ts (Node.js runtime).
// Neon Auth redirects unauthenticated requests to the sign-in view.
export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: [
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
