import "server-only";

import { redirect } from "next/navigation";

import { auth } from "./server";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * Resolve the signed-in user or redirect to sign-in.
 * Every server action and RSC data fetch starts here, and every query adds
 * a `user_id = user.id` predicate — ownership is enforced in depth, never
 * inferred from a widget id alone.
 */
export async function requireUser(): Promise<SessionUser> {
  const { data: session } = await auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/auth/sign-in");
  }

  return { id: user.id, email: user.email, name: user.name };
}
