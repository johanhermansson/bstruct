"use client";

import { useState } from "react";

import type { WidgetColor } from "@/lib/types";

export const stickySurface: Record<WidgetColor, string> = {
  yellow:
    "bg-sticky-yellow text-sticky-yellow-ink border-t-sticky-yellow-edge",
  blue: "bg-sticky-blue text-sticky-blue-ink border-t-sticky-blue-edge",
  green: "bg-sticky-green text-sticky-green-ink border-t-sticky-green-edge",
  red: "bg-sticky-red text-sticky-red-ink border-t-sticky-red-edge",
  purple:
    "bg-sticky-purple text-sticky-purple-ink border-t-sticky-purple-edge",
};

export const stickySwatch: Record<WidgetColor, string> = {
  yellow: "bg-sticky-yellow-edge",
  blue: "bg-sticky-blue-edge",
  green: "bg-sticky-green-edge",
  red: "bg-sticky-red-edge",
  purple: "bg-sticky-purple-edge",
};

const COLORS: WidgetColor[] = ["yellow", "blue", "green", "red", "purple"];

type WidgetChromeProps = {
  title: React.ReactNode;
  color: WidgetColor;
  /** Handle props from useFreeDrag (board view); omit in stack view. */
  handleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  onRename?: (title: string) => void;
  currentTitle?: string;
  onColorChange: (color: WidgetColor) => void;
  onRemove: () => void;
  removeLabel: string;
  children: React.ReactNode;
};

/**
 * Shared widget card: sticky-tinted rounded surface, colored top edge,
 * a draggable header handle with inline rename, and a small footer menu
 * (color swatches + remove).
 */
export function WidgetChrome({
  title,
  color,
  handleProps,
  isDragging,
  onRename,
  currentTitle,
  onColorChange,
  onRemove,
  removeLabel,
  children,
}: WidgetChromeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commitRename = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (onRename && trimmed && trimmed !== currentTitle) onRename(trimmed);
  };

  return (
    <section
      className={`group flex w-full flex-col rounded-2xl border-t-4 shadow-widget transition-[box-shadow,transform,rotate] duration-150 ${stickySurface[color]} ${
        isDragging
          ? "rotate-[0.5deg] scale-[1.02] shadow-widget-lifted"
          : ""
      }`}
    >
      <div
        {...handleProps}
        tabIndex={handleProps ? 0 : undefined}
        role={handleProps ? "button" : undefined}
        aria-label={
          handleProps
            ? "Drag to move. Arrow keys move, hold Shift for fine steps."
            : undefined
        }
        className={`flex items-center gap-2 rounded-t-xl px-4 pt-3 pb-1 ${
          handleProps ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        {editing && onRename ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-full rounded-md bg-white/40 px-2 py-0.5 font-display text-2xl outline-none dark:bg-black/20"
            aria-label="Widget title"
          />
        ) : (
          <h2
            className="min-h-7 flex-1 truncate font-display text-2xl leading-7"
            onDoubleClick={() => {
              if (!onRename) return;
              setDraft(currentTitle ?? "");
              setEditing(true);
            }}
          >
            {title}
          </h2>
        )}

        <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {onRename && !editing && (
            <button
              type="button"
              onClick={() => {
                setDraft(currentTitle ?? "");
                setEditing(true);
              }}
              className="rounded-md px-1.5 py-0.5 text-xs opacity-70 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
              aria-label="Rename"
              title="Rename"
            >
              ✎
            </button>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-md px-1.5 py-0.5 text-xs opacity-70 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
            aria-label="Widget options"
            aria-expanded={menuOpen}
            title="Options"
          >
            •••
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex items-center justify-between gap-2 px-4 py-1.5">
          <div className="flex gap-1.5" role="group" aria-label="Card color">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onColorChange(c);
                  setMenuOpen(false);
                }}
                className={`size-5 rounded-full ${stickySwatch[c]} ${
                  c === color ? "ring-2 ring-ink/60 ring-offset-1" : ""
                }`}
                aria-label={`Set color ${c}`}
                aria-pressed={c === color}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md px-2 py-0.5 text-xs text-urgent hover:bg-black/10 dark:hover:bg-white/10"
          >
            {removeLabel}
          </button>
        </div>
      )}

      <div className="px-4 pt-1 pb-4">{children}</div>
    </section>
  );
}
