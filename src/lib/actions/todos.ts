"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { boards, todoItems, todoLists, widgetColor } from "@/lib/db/schema";
import type { TodoItemDTO, TodoListDTO } from "@/lib/types";

const titleSchema = z.string().trim().min(1).max(300);
const colorSchema = z.enum(widgetColor.enumValues);

export async function createTodoList(
  boardId: number,
  title: string,
  position: { x: number; y: number; z: number },
): Promise<TodoListDTO> {
  const user = await requireUser();
  const parsedTitle = z.string().trim().max(200).parse(title);

  const [board] = await db
    .select({ id: boards.id })
    .from(boards)
    .where(and(eq(boards.id, boardId), eq(boards.userId, user.id)));
  if (!board) throw new Error("Board not found");

  const [created] = await db
    .insert(todoLists)
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

export async function renameTodoList(listId: number, title: string) {
  const user = await requireUser();
  const parsed = z.string().trim().max(200).parse(title);

  await db
    .update(todoLists)
    .set({ title: parsed })
    .where(and(eq(todoLists.id, listId), eq(todoLists.userId, user.id)));
}

export async function setTodoListColor(
  listId: number,
  color: (typeof widgetColor.enumValues)[number],
) {
  const user = await requireUser();
  const parsed = colorSchema.parse(color);

  await db
    .update(todoLists)
    .set({ color: parsed })
    .where(and(eq(todoLists.id, listId), eq(todoLists.userId, user.id)));
}

export async function deleteTodoList(listId: number) {
  const user = await requireUser();

  await db
    .delete(todoLists)
    .where(and(eq(todoLists.id, listId), eq(todoLists.userId, user.id)));
}

export async function createTodoItem(
  listId: number,
  title: string,
): Promise<TodoItemDTO> {
  const user = await requireUser();
  const parsedTitle = titleSchema.parse(title);

  const [list] = await db
    .select({ id: todoLists.id })
    .from(todoLists)
    .where(and(eq(todoLists.id, listId), eq(todoLists.userId, user.id)));
  if (!list) throw new Error("List not found");

  const [{ next }] = await db
    .select({
      next: sql<number>`coalesce(max(${todoItems.listOrder}), 0) + 1`,
    })
    .from(todoItems)
    .where(eq(todoItems.listId, listId));

  const [created] = await db
    .insert(todoItems)
    .values({ userId: user.id, listId, title: parsedTitle, listOrder: next })
    .returning();

  return {
    id: created.id,
    title: created.title,
    listOrder: created.listOrder,
    completedAt: null,
  };
}

export async function renameTodoItem(itemId: number, title: string) {
  const user = await requireUser();
  const parsed = titleSchema.parse(title);

  await db
    .update(todoItems)
    .set({ title: parsed })
    .where(and(eq(todoItems.id, itemId), eq(todoItems.userId, user.id)));
}

export async function toggleTodoItem(itemId: number, done: boolean) {
  const user = await requireUser();

  await db
    .update(todoItems)
    .set({ completedAt: done ? new Date() : null })
    .where(and(eq(todoItems.id, itemId), eq(todoItems.userId, user.id)));
}

export async function deleteTodoItem(itemId: number) {
  const user = await requireUser();

  await db
    .delete(todoItems)
    .where(and(eq(todoItems.id, itemId), eq(todoItems.userId, user.id)));
}

/** Persist a full reorder of a list's items (drag-sorted client side). */
export async function reorderTodoItems(listId: number, orderedIds: number[]) {
  const user = await requireUser();
  const ids = z.array(z.number().int().positive()).max(500).parse(orderedIds);
  if (ids.length === 0) return;

  const owned = await db
    .select({ id: todoItems.id })
    .from(todoItems)
    .where(
      and(
        eq(todoItems.listId, listId),
        eq(todoItems.userId, user.id),
        inArray(todoItems.id, ids),
      ),
    );
  const ownedIds = new Set(owned.map((row) => row.id));

  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      if (!ownedIds.has(id)) continue;
      await tx
        .update(todoItems)
        .set({ listOrder: index + 1 })
        .where(and(eq(todoItems.id, id), eq(todoItems.userId, user.id)));
    }
  });
}
