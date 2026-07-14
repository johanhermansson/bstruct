"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import {
  boards,
  structItems,
  structLevels,
  structUpdates,
  structs,
  widgetColor,
} from "@/lib/db/schema";
import type { StructDTO, StructItemDTO } from "@/lib/types";

const titleSchema = z.string().trim().min(1).max(200);
const colorSchema = z.enum(widgetColor.enumValues);

export async function createStruct(
  boardId: number,
  title: string,
  position: { x: number; y: number; z: number },
): Promise<StructDTO> {
  const user = await requireUser();
  const parsedTitle = titleSchema.parse(title);

  const [board] = await db
    .select({ id: boards.id })
    .from(boards)
    .where(and(eq(boards.id, boardId), eq(boards.userId, user.id)));
  if (!board) throw new Error("Board not found");

  const [created] = await db
    .insert(structs)
    .values({
      userId: user.id,
      boardId,
      title: parsedTitle,
      positionX: position.x,
      positionY: position.y,
      positionZ: position.z,
    })
    .returning();

  revalidatePath(`/boards/${boardId}`);
  return {
    id: created.id,
    title: created.title,
    color: created.color,
    x: created.positionX,
    y: created.positionY,
    z: created.positionZ,
    items: [],
  };
}

export async function renameStruct(structId: number, title: string) {
  const user = await requireUser();
  const parsed = titleSchema.parse(title);

  await db
    .update(structs)
    .set({ title: parsed })
    .where(and(eq(structs.id, structId), eq(structs.userId, user.id)));
}

export async function setStructColor(
  structId: number,
  color: (typeof widgetColor.enumValues)[number],
) {
  const user = await requireUser();
  const parsed = colorSchema.parse(color);

  await db
    .update(structs)
    .set({ color: parsed })
    .where(and(eq(structs.id, structId), eq(structs.userId, user.id)));
}

export async function deleteStruct(structId: number) {
  const user = await requireUser();

  await db
    .delete(structs)
    .where(and(eq(structs.id, structId), eq(structs.userId, user.id)));

  revalidatePath("/", "layout");
}

export async function createStructItem(
  structId: number,
  input: { title: string; levelId: number },
): Promise<StructItemDTO> {
  const user = await requireUser();
  const title = titleSchema.parse(input.title);
  const levelId = z.number().int().positive().parse(input.levelId);

  const [owned] = await db
    .select({ id: structs.id })
    .from(structs)
    .where(and(eq(structs.id, structId), eq(structs.userId, user.id)));
  if (!owned) throw new Error("Struct not found");

  const [level] = await db
    .select()
    .from(structLevels)
    .where(eq(structLevels.id, levelId));
  if (!level) throw new Error("Unknown recurrence level");

  const [created] = await db
    .insert(structItems)
    .values({ userId: user.id, structId, title, levelId })
    .returning();

  revalidatePath("/", "layout");
  return {
    id: created.id,
    title: created.title,
    levelId: created.levelId,
    levelTitle: level.title,
    levelSeconds: level.levelSeconds,
    lastDoneAt: created.lastDoneAt.toISOString(),
  };
}

export async function updateStructItem(
  itemId: number,
  input: { title?: string; levelId?: number },
) {
  const user = await requireUser();
  const patch: Partial<{ title: string; levelId: number }> = {};

  if (input.title !== undefined) patch.title = titleSchema.parse(input.title);
  if (input.levelId !== undefined) {
    const levelId = z.number().int().positive().parse(input.levelId);
    const [level] = await db
      .select({ id: structLevels.id })
      .from(structLevels)
      .where(eq(structLevels.id, levelId));
    if (!level) throw new Error("Unknown recurrence level");
    patch.levelId = levelId;
  }

  if (Object.keys(patch).length === 0) return;

  await db
    .update(structItems)
    .set(patch)
    .where(and(eq(structItems.id, itemId), eq(structItems.userId, user.id)));

  revalidatePath("/", "layout");
}

export async function deleteStructItem(itemId: number) {
  const user = await requireUser();

  await db
    .delete(structItems)
    .where(and(eq(structItems.id, itemId), eq(structItems.userId, user.id)));

  revalidatePath("/", "layout");
}

/**
 * Check off a due item — the exact port of the legacy `refresh_item()`:
 * reset the decay clock AND record a completion-history row, atomically.
 */
export async function checkOffStructItem(
  itemId: number,
): Promise<{ lastDoneAt: string }> {
  const user = await requireUser();

  const lastDoneAt = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(structItems)
      .set({ lastDoneAt: new Date() })
      .where(and(eq(structItems.id, itemId), eq(structItems.userId, user.id)))
      .returning({ lastDoneAt: structItems.lastDoneAt });

    if (!updated) throw new Error("Item not found");

    await tx.insert(structUpdates).values({
      userId: user.id,
      itemId,
      doneAt: updated.lastDoneAt,
    });

    return updated.lastDoneAt;
  });

  revalidatePath("/", "layout");
  return { lastDoneAt: lastDoneAt.toISOString() };
}
