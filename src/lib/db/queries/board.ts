import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  boards,
  notes,
  structItems,
  structLevels,
  structs,
  todoItems,
  todoLists,
} from "@/lib/db/schema";
import type {
  BoardData,
  BoardSummary,
  StructDTO,
  StructLevelDTO,
  TodoListDTO,
} from "@/lib/types";

export async function getBoards(userId: string): Promise<BoardSummary[]> {
  return db
    .select({ id: boards.id, title: boards.title })
    .from(boards)
    .where(eq(boards.userId, userId))
    .orderBy(asc(boards.createdAt), asc(boards.id));
}

/** Returns the user's default board, creating one on first visit. */
export async function getOrCreateDefaultBoard(
  userId: string,
): Promise<BoardSummary> {
  const existing = await getBoards(userId);
  if (existing.length > 0) return existing[0];

  const [created] = await db
    .insert(boards)
    .values({ userId, title: "My board" })
    .returning({ id: boards.id, title: boards.title });
  return created;
}

export async function getBoardData(
  userId: string,
  boardId: number,
): Promise<BoardData | null> {
  const allBoards = await getBoards(userId);
  const board = allBoards.find((b) => b.id === boardId);
  if (!board) return null;

  const scope = { user: userId, board: boardId };

  const [noteRows, listRows, itemRows, structRows, structItemRows] =
    await Promise.all([
      db
        .select()
        .from(notes)
        .where(and(eq(notes.userId, scope.user), eq(notes.boardId, scope.board))),
      db
        .select()
        .from(todoLists)
        .where(
          and(
            eq(todoLists.userId, scope.user),
            eq(todoLists.boardId, scope.board),
          ),
        ),
      db
        .select({
          id: todoItems.id,
          listId: todoItems.listId,
          title: todoItems.title,
          listOrder: todoItems.listOrder,
          completedAt: todoItems.completedAt,
        })
        .from(todoItems)
        .innerJoin(todoLists, eq(todoLists.id, todoItems.listId))
        .where(
          and(
            eq(todoItems.userId, scope.user),
            eq(todoLists.boardId, scope.board),
          ),
        )
        .orderBy(asc(todoItems.listOrder), asc(todoItems.id)),
      db
        .select()
        .from(structs)
        .where(
          and(eq(structs.userId, scope.user), eq(structs.boardId, scope.board)),
        ),
      db
        .select({
          id: structItems.id,
          structId: structItems.structId,
          title: structItems.title,
          levelId: structItems.levelId,
          levelTitle: structLevels.title,
          levelSeconds: structLevels.levelSeconds,
          lastDoneAt: structItems.lastDoneAt,
          urgency: sql<number>`extract(epoch from (now() - ${structItems.lastDoneAt})) / ${structLevels.levelSeconds}`,
        })
        .from(structItems)
        .innerJoin(structLevels, eq(structLevels.id, structItems.levelId))
        .innerJoin(structs, eq(structs.id, structItems.structId))
        .where(
          and(
            eq(structItems.userId, scope.user),
            eq(structs.boardId, scope.board),
          ),
        )
        .orderBy(sql`urgency desc`),
    ]);

  const todoListDTOs: TodoListDTO[] = listRows.map((list) => ({
    id: list.id,
    title: list.title,
    color: list.color,
    x: list.positionX,
    y: list.positionY,
    z: list.positionZ,
    items: itemRows
      .filter((item) => item.listId === list.id)
      .map((item) => ({
        id: item.id,
        title: item.title,
        listOrder: item.listOrder,
        completedAt: item.completedAt?.toISOString() ?? null,
      })),
  }));

  const structDTOs: StructDTO[] = structRows.map((s) => ({
    id: s.id,
    title: s.title,
    color: s.color,
    x: s.positionX,
    y: s.positionY,
    z: s.positionZ,
    items: structItemRows
      .filter((item) => item.structId === s.id)
      .map((item) => ({
        id: item.id,
        title: item.title,
        levelId: item.levelId,
        levelTitle: item.levelTitle,
        levelSeconds: item.levelSeconds,
        lastDoneAt: item.lastDoneAt.toISOString(),
      })),
  }));

  return {
    board,
    boards: allBoards,
    notes: noteRows.map((n) => ({
      id: n.id,
      content: n.content,
      color: n.color,
      x: n.positionX,
      y: n.positionY,
      z: n.positionZ,
    })),
    todoLists: todoListDTOs,
    structs: structDTOs,
  };
}

export async function getStructLevels(): Promise<StructLevelDTO[]> {
  return db
    .select({
      id: structLevels.id,
      title: structLevels.title,
      levelSeconds: structLevels.levelSeconds,
    })
    .from(structLevels)
    .orderBy(asc(structLevels.levelOrder));
}
