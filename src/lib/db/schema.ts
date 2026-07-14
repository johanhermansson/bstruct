import {
  bigint,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Users are managed by Neon Auth (managed Better Auth) in the `neon_auth`
 * schema of the same database. We reference them by their text id and enforce
 * ownership with a `WHERE user_id = <session user>` predicate on every query.
 * Optional cross-schema foreign keys live in drizzle/optional/neon_auth_fks.sql
 * so drizzle-kit never tries to manage the provider-owned schema
 * (drizzle.config.ts uses schemaFilter: ['public']).
 */

export const widgetColor = pgEnum("widget_color", [
  "yellow",
  "blue",
  "green",
  "red",
  "purple",
]);

export type WidgetColor = (typeof widgetColor.enumValues)[number];

const ownership = {
  userId: text("user_id").notNull(),
};

const positions = {
  positionX: integer("position_x").notNull().default(20),
  positionY: integer("position_y").notNull().default(20),
  positionZ: integer("position_z").notNull().default(1),
};

export const boards = pgTable(
  "boards",
  {
    id: serial("id").primaryKey(),
    ...ownership,
    title: text("title").notNull().default("My board"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("boards_user_idx").on(t.userId)],
);

export const notes = pgTable(
  "notes",
  {
    id: serial("id").primaryKey(),
    ...ownership,
    boardId: integer("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    content: text("content").notNull().default(""),
    color: widgetColor("color").notNull().default("yellow"),
    ...positions,
  },
  (t) => [index("notes_board_idx").on(t.boardId)],
);

export const todoLists = pgTable(
  "todo_lists",
  {
    id: serial("id").primaryKey(),
    ...ownership,
    boardId: integer("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    color: widgetColor("color").notNull().default("yellow"),
    ...positions,
  },
  (t) => [index("todo_lists_board_idx").on(t.boardId)],
);

export const todoItems = pgTable(
  "todo_items",
  {
    id: serial("id").primaryKey(),
    ...ownership,
    listId: integer("list_id")
      .notNull()
      .references(() => todoLists.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    listOrder: integer("list_order").notNull().default(0),
    // Timestamp rather than boolean: preserves *when* it was completed,
    // matching the legacy `date_completed` column.
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("todo_items_list_idx").on(t.listId, t.listOrder)],
);

/**
 * Recurrence levels — a seeded lookup table (see drizzle/seed.sql).
 * `levelSeconds` is the recurrence interval; an item's urgency is
 * elapsed-seconds-since-last-done / levelSeconds.
 */
export const structLevels = pgTable("struct_levels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  levelSeconds: bigint("level_seconds", { mode: "number" }).notNull(),
  levelOrder: integer("level_order").notNull(),
});

/** A struct is a themed group of recurring reminders (legacy `struct_types`). */
export const structs = pgTable(
  "structs",
  {
    id: serial("id").primaryKey(),
    ...ownership,
    boardId: integer("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    color: widgetColor("color").notNull().default("yellow"),
    ...positions,
  },
  (t) => [index("structs_board_idx").on(t.boardId)],
);

export const structItems = pgTable(
  "struct_items",
  {
    id: serial("id").primaryKey(),
    ...ownership,
    structId: integer("struct_id")
      .notNull()
      .references(() => structs.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    levelId: integer("level_id")
      .notNull()
      .references(() => structLevels.id),
    lastDoneAt: timestamp("last_done_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("struct_items_struct_idx").on(t.structId),
    index("struct_items_user_idx").on(t.userId),
  ],
);

/** Completion history — one row per check-off (legacy `struct_updates`). */
export const structUpdates = pgTable(
  "struct_updates",
  {
    id: serial("id").primaryKey(),
    ...ownership,
    itemId: integer("item_id")
      .notNull()
      .references(() => structItems.id, { onDelete: "cascade" }),
    doneAt: timestamp("done_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("struct_updates_item_idx").on(t.itemId, t.doneAt)],
);
