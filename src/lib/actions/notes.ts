"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { boards, notes, widgetColor } from "@/lib/db/schema";
import type { NoteDTO } from "@/lib/types";

const contentSchema = z.string().max(5_000);
const colorSchema = z.enum(widgetColor.enumValues);

export async function createNote(
  boardId: number,
  position: { x: number; y: number; z: number },
): Promise<NoteDTO> {
  const user = await requireUser();

  const [board] = await db
    .select({ id: boards.id })
    .from(boards)
    .where(and(eq(boards.id, boardId), eq(boards.userId, user.id)));
  if (!board) throw new Error("Board not found");

  const [created] = await db
    .insert(notes)
    .values({
      userId: user.id,
      boardId,
      positionX: position.x,
      positionY: position.y,
      positionZ: position.z,
    })
    .returning();

  revalidatePath(`/boards/${boardId}`);
  return {
    id: created.id,
    content: created.content,
    color: created.color,
    x: created.positionX,
    y: created.positionY,
    z: created.positionZ,
  };
}

export async function updateNoteContent(noteId: number, content: string) {
  const user = await requireUser();
  const parsed = contentSchema.parse(content);

  await db
    .update(notes)
    .set({ content: parsed })
    .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));
}

export async function setNoteColor(
  noteId: number,
  color: (typeof widgetColor.enumValues)[number],
) {
  const user = await requireUser();
  const parsed = colorSchema.parse(color);

  await db
    .update(notes)
    .set({ color: parsed })
    .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));
}

export async function deleteNote(noteId: number) {
  const user = await requireUser();

  await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));
}
