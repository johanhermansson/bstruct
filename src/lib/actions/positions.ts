"use server";

import { requireUser } from "@/lib/auth/session";
import {
  applyPositionPatches,
  positionPatchesSchema,
} from "@/lib/db/mutations/positions";
import type { PositionPatch } from "@/lib/types";

/**
 * Batched position persistence, mirroring the legacy `dash/positions`
 * endpoint: the client debounces drags into one call carrying every widget
 * whose x/y/z changed. Deliberately no revalidatePath — the client store
 * is already authoritative for positions.
 */
export async function updatePositions(patches: PositionPatch[]) {
  const user = await requireUser();
  const parsed = positionPatchesSchema.parse(patches);
  await applyPositionPatches(user.id, parsed);
}
