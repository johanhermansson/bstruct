"use client";

import { useMemo } from "react";

import { useBoardState } from "@/components/board/board-store";
import { WidgetCard, widgetOf, type AnyWidget } from "@/components/board/widget-card";
import type { StructLevelDTO } from "@/lib/types";

/**
 * Mobile: the same widgets as a vertical stack of cards instead of a
 * free-form board, ordered by their board position (top-to-bottom,
 * left-to-right) so the spatial arrangement still roughly carries over.
 */
export function StackView({ levels }: { levels: StructLevelDTO[] }) {
  const state = useBoardState();

  const widgets: AnyWidget[] = useMemo(() => {
    const all: AnyWidget[] = [
      ...state.notes.map((note) => ({ kind: "note", note }) as const),
      ...state.todoLists.map((list) => ({ kind: "todo", list }) as const),
      ...state.structs.map((struct) => ({ kind: "struct", struct }) as const),
    ];
    return all.sort((a, b) => {
      const wa = widgetOf(a);
      const wb = widgetOf(b);
      return wa.y - wb.y || wa.x - wb.x;
    });
  }, [state.notes, state.todoLists, state.structs]);

  if (widgets.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-ink-muted">
        <p className="font-display text-3xl">A clean desk!</p>
        <p className="mt-2 text-sm">
          Add a note, a todo list or a struct of recurring reminders from the
          toolbar above.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl snap-y flex-col gap-4 px-4 pb-24 pt-2">
      {widgets.map((widget) => {
        const { kind, id } = widgetOf(widget);
        return (
          <div key={`${kind}:${id}`} className="snap-start scroll-mt-20">
            <WidgetCard widget={widget} levels={levels} />
          </div>
        );
      })}
    </div>
  );
}
