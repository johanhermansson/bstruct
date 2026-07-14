"use client";

import { useCallback, useRef, useState } from "react";
import type React from "react";

type FreeDragOptions = {
  position: { x: number; y: number };
  /** Called on pointer down — bring the widget to the front. */
  onLift(): void;
  /** Called once on drop with the final, clamped position. */
  onDrop(x: number, y: number): void;
  /** Called for keyboard nudges (already clamped). */
  onNudge?(x: number, y: number): void;
  disabled?: boolean;
};

const INTERACTIVE = "input, textarea, select, button, a, [contenteditable]";

function clamp(x: number, y: number) {
  return { x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)) };
}

/**
 * Free-position dragging for board widgets via pointer events — no DnD
 * library needed for this: we only translate a widget by pointer delta.
 * While dragging, the delta is applied as a `transform` (compositor-only);
 * the committed position only changes on drop.
 *
 * Keyboard support on the handle: arrows move 10px (Shift for 1px).
 */
export function useFreeDrag({
  position,
  onLift,
  onDrop,
  onNudge,
  disabled,
}: FreeDragOptions) {
  const [delta, setDelta] = useState<{ dx: number; dy: number } | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
    dx: number;
    dy: number;
    raf: number | null;
  } | null>(null);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;
      if ((event.target as HTMLElement).closest(INTERACTIVE)) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        originX: position.x,
        originY: position.y,
        dx: 0,
        dy: 0,
        raf: null,
      };
      onLift();
    },
    [disabled, onLift, position.x, position.y],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      drag.dx = event.clientX - drag.startClientX;
      drag.dy = event.clientY - drag.startClientY;

      if (drag.raf === null) {
        drag.raf = requestAnimationFrame(() => {
          drag.raf = null;
          const current = dragRef.current;
          if (current) setDelta({ dx: current.dx, dy: current.dy });
        });
      }
    },
    [],
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;

      if (drag.raf !== null) cancelAnimationFrame(drag.raf);
      dragRef.current = null;
      setDelta(null);

      const moved = Math.abs(drag.dx) > 2 || Math.abs(drag.dy) > 2;
      if (moved) {
        const { x, y } = clamp(drag.originX + drag.dx, drag.originY + drag.dy);
        onDrop(x, y);
      }
    },
    [onDrop],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (disabled || !onNudge) return;
      const step = event.shiftKey ? 1 : 10;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = moves[event.key];
      if (!move) return;

      event.preventDefault();
      onLift();
      const { x, y } = clamp(position.x + move[0], position.y + move[1]);
      onNudge(x, y);
    },
    [disabled, onLift, onNudge, position.x, position.y],
  );

  return {
    isDragging: delta !== null,
    /** Compositor-only transform applied while dragging. */
    dragTransform: delta
      ? `translate3d(${delta.dx}px, ${delta.dy}px, 0)`
      : undefined,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown,
      style: { touchAction: "none" } as React.CSSProperties,
    },
  };
}
