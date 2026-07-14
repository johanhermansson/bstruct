"use client";

import { NoteCard } from "@/components/widgets/note-card";
import { StructCard } from "@/components/widgets/struct-card";
import { TodoCard } from "@/components/widgets/todo-card";
import type {
  NoteDTO,
  StructDTO,
  StructLevelDTO,
  TodoListDTO,
  WidgetKind,
} from "@/lib/types";

export type AnyWidget =
  | { kind: "note"; note: NoteDTO }
  | { kind: "todo"; list: TodoListDTO }
  | { kind: "struct"; struct: StructDTO };

export function widgetOf(w: AnyWidget): {
  kind: WidgetKind;
  id: number;
  x: number;
  y: number;
} {
  switch (w.kind) {
    case "note":
      return { kind: "note", id: w.note.id, x: w.note.x, y: w.note.y };
    case "todo":
      return { kind: "todo", id: w.list.id, x: w.list.x, y: w.list.y };
    case "struct":
      return { kind: "struct", id: w.struct.id, x: w.struct.x, y: w.struct.y };
  }
}

/** Renders the right card for a widget — shared by board and stack views. */
export function WidgetCard({
  widget,
  levels,
  handleProps,
  isDragging,
}: {
  widget: AnyWidget;
  levels: StructLevelDTO[];
  handleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}) {
  switch (widget.kind) {
    case "note":
      return (
        <NoteCard
          note={widget.note}
          handleProps={handleProps}
          isDragging={isDragging}
        />
      );
    case "todo":
      return (
        <TodoCard
          list={widget.list}
          handleProps={handleProps}
          isDragging={isDragging}
        />
      );
    case "struct":
      return (
        <StructCard
          struct={widget.struct}
          levels={levels}
          handleProps={handleProps}
          isDragging={isDragging}
        />
      );
  }
}
