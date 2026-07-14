import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  boards,
  structItems,
  structLevels,
  structs,
} from "@/lib/db/schema";
import type { UpNextItem } from "@/lib/types";

/**
 * Every struct item the user owns, across all boards, ordered by urgency —
 * the same decay ratio the legacy app used for in-widget ordering:
 *   urgency = elapsed seconds since last done / recurrence interval
 * Items with urgency >= 1 are due now; the rest are "coming up".
 */
export async function getUpNext(userId: string): Promise<UpNextItem[]> {
  const urgency = sql<number>`extract(epoch from (now() - ${structItems.lastDoneAt})) / ${structLevels.levelSeconds}`;

  const rows = await db
    .select({
      itemId: structItems.id,
      title: structItems.title,
      lastDoneAt: structItems.lastDoneAt,
      structId: structs.id,
      structTitle: structs.title,
      color: structs.color,
      boardId: boards.id,
      boardTitle: boards.title,
      levelTitle: structLevels.title,
      levelSeconds: structLevels.levelSeconds,
      urgency: urgency.as("urgency"),
    })
    .from(structItems)
    .innerJoin(structs, eq(structs.id, structItems.structId))
    .innerJoin(boards, eq(boards.id, structs.boardId))
    .innerJoin(structLevels, eq(structLevels.id, structItems.levelId))
    .where(eq(structItems.userId, userId))
    .orderBy(desc(sql`urgency`));

  return rows.map((row) => ({
    ...row,
    lastDoneAt: row.lastDoneAt.toISOString(),
    urgency: Number(row.urgency),
  }));
}

export async function getDueCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(structItems)
    .innerJoin(structLevels, eq(structLevels.id, structItems.levelId))
    .where(
      sql`${structItems.userId} = ${userId} and extract(epoch from (now() - ${structItems.lastDoneAt})) > ${structLevels.levelSeconds}`,
    );

  return Number(row?.count ?? 0);
}
