import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import {
  applyPositionPatches,
  positionPatchesSchema,
} from "@/lib/db/mutations/positions";

/**
 * sendBeacon target for flushing unsaved widget positions when the page is
 * hidden or unloading — beacons can't invoke server actions. Same code path
 * as the updatePositions action otherwise.
 */
export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = positionPatchesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await applyPositionPatches(session.user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
