"use client";

import { useMemo } from "react";

import {
  useBoardDispatch,
  useBoardState,
  widgetKey,
  zOf,
  type WidgetKey,
} from "./board-store";
import { WidgetCard, widgetOf, type AnyWidget } from "./widget-card";
import { useFreeDrag } from "@/hooks/use-free-drag";
import type { StructLevelDTO } from "@/lib/types";

const WIDGET_WIDTH = 320;

/** Desktop: the free-form canvas of absolutely-positioned widgets. */
export function BoardView({ levels }: { levels: StructLevelDTO[] }) {
  const state = useBoardState();

  const widgets: AnyWidget[] = useMemo(
    () => [
      ...state.notes.map((note) => ({ kind: "note", note }) as const),
      ...state.todoLists.map((list) => ({ kind: "todo", list }) as const),
      ...state.structs.map((struct) => ({ kind: "struct", struct }) as const),
    ],
    [state.notes, state.todoLists, state.structs],
  );

  const canvasHeight = useMemo(() => {
    const maxY = widgets.reduce((max, w) => Math.max(max, widgetOf(w).y), 0);
    return Math.max(maxY + 480, 720);
  }, [widgets]);

  return (
    <div className="overflow-auto">
      <div
        className="board-canvas relative min-w-[1200px]"
        style={{ height: canvasHeight }}
      >
        {widgets.map((widget) => {
          const { kind, id } = widgetOf(widget);
          return (
            <DraggableWidget
              key={widgetKey(kind, id)}
              widget={widget}
              levels={levels}
            />
          );
        })}

        {widgets.length === 0 && (
          <div className="absolute inset-x-0 top-24 mx-auto max-w-md text-center text-ink-muted">
            <p className="font-display text-3xl">A clean desk!</p>
            <p className="mt-2 text-sm">
              Add a note, a todo list or a struct of recurring reminders from
              the toolbar above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableWidget({
  widget,
  levels,
}: {
  widget: AnyWidget;
  levels: StructLevelDTO[];
}) {
  const state = useBoardState();
  const dispatch = useBoardDispatch();

  const { kind, id, x, y } = widgetOf(widget);
  const key: WidgetKey = widgetKey(kind, id);
  const z = zOf(state, key);

  const { isDragging, dragTransform, handleProps } = useFreeDrag({
    position: { x, y },
    onLift: () => dispatch({ type: "lift", key }),
    onDrop: (nx, ny) => dispatch({ type: "move", key, x: nx, y: ny }),
    onNudge: (nx, ny) => dispatch({ type: "move", key, x: nx, y: ny }),
  });

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        zIndex: isDragging ? 9999 : z,
        width: WIDGET_WIDTH,
        transform: dragTransform,
      }}
    >
      <WidgetCard
        widget={widget}
        levels={levels}
        handleProps={handleProps}
        isDragging={isDragging}
      />
    </div>
  );
}
