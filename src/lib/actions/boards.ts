"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { boards } from "@/lib/db/schema";

export async function createBoard(title: string) {
  const user = await requireUser();
  const parsed = z.string().trim().min(1).max(120).parse(title);

  const [created] = await db
    .insert(boards)
    .values({ userId: user.id, title: parsed })
    .returning({ id: boards.id });

  revalidatePath("/boards");
  redirect(`/boards/${created.id}`);
}

export async function renameBoard(boardId: number, title: string) {
  const user = await requireUser();
  const parsed = z.string().trim().min(1).max(120).parse(title);

  await db
    .update(boards)
    .set({ title: parsed })
    .where(and(eq(boards.id, boardId), eq(boards.userId, user.id)));

  revalidatePath("/boards");
}

export async function deleteBoard(boardId: number) {
  const user = await requireUser();

  await db
    .delete(boards)
    .where(and(eq(boards.id, boardId), eq(boards.userId, user.id)));

  revalidatePath("/boards");
  redirect("/boards");
}
