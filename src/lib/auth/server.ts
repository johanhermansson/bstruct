import { createNeonAuth } from "@neondatabase/auth/next/server";

// Placeholders keep `next build` working in environments without secrets
// (module evaluation happens during build). Real values are required at
// runtime — see README "Environment variables".
const baseUrl =
  process.env.NEON_AUTH_BASE_URL ?? "https://placeholder.neon.invalid";
const secret =
  process.env.NEON_AUTH_COOKIE_SECRET ??
  "build-time-placeholder-secret-do-not-use!";

export const auth = createNeonAuth({
  baseUrl,
  cookies: { secret },
});
