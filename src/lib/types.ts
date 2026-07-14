import type { WidgetColor } from "@/lib/db/schema";

export type { WidgetColor };

export type WidgetKind = "note" | "todo" | "struct";

export type WidgetPosition = { x: number; y: number; z: number };

export type NoteDTO = WidgetPosition & {
  id: number;
  content: string;
  color: WidgetColor;
};

export type TodoItemDTO = {
  id: number;
  title: string;
  listOrder: number;
  completedAt: string | null;
};

export type TodoListDTO = WidgetPosition & {
  id: number;
  title: string;
  color: WidgetColor;
  items: TodoItemDTO[];
};

export type StructItemDTO = {
  id: number;
  title: string;
  levelId: number;
  levelTitle: string;
  levelSeconds: number;
  /** ISO timestamp of the last check-off. */
  lastDoneAt: string;
};

export type StructDTO = WidgetPosition & {
  id: number;
  title: string;
  color: WidgetColor;
  items: StructItemDTO[];
};

export type BoardSummary = { id: number; title: string };

export type BoardData = {
  board: BoardSummary;
  boards: BoardSummary[];
  notes: NoteDTO[];
  todoLists: TodoListDTO[];
  structs: StructDTO[];
};

export type StructLevelDTO = {
  id: number;
  title: string;
  levelSeconds: number;
};

export type UpNextItem = {
  itemId: number;
  title: string;
  lastDoneAt: string;
  structId: number;
  structTitle: string;
  color: WidgetColor;
  boardId: number;
  boardTitle: string;
  levelTitle: string;
  levelSeconds: number;
  urgency: number;
};

export type PositionPatch = WidgetPosition & {
  kind: WidgetKind;
  id: number;
};
