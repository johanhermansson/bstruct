import "server-only";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db/client";
import { notes, structs, todoLists } from "@/lib/db/schema";

export const positionPatchSchema = z.object({
  kind: z.enum(["note", "todo", "struct"]),
  id: z.number().int().positive(),
  x: z.number().int().min(0).max(20_000),
  y: z.number().int().min(0).max(100_000),
  z: z.number().int().min(0).max(10_000),
});

export const positionPatchesSchema = z.array(positionPatchSchema).max(200);

const tableFor = {
  note: notes,
  todo: todoLists,
  struct: structs,
} as const;

/**
 * Batched position persistence shared by the server action (debounced
 * drags) and the sendBeacon route (flush on page hide). Every UPDATE is
 * scoped by user_id — a widget id alone is never trusted.
 */
export async function applyPositionPatches(
  userId: string,
  patches: z.infer<typeof positionPatchesSchema>,
) {
  if (patches.length === 0) return;

  await db.transaction(async (tx) => {
    for (const patch of patches) {
      const table = tableFor[patch.kind];
      await tx
        .update(table)
        .set({ positionX: patch.x, positionY: patch.y, positionZ: patch.z })
        .where(and(eq(table.id, patch.id), eq(table.userId, userId)));
    }
  });
}
