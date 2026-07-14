"use client";

import { useMemo, useState } from "react";

import { WidgetChrome } from "./widget-chrome";
import { useBoardDispatch } from "@/components/board/board-store";
import {
  checkOffStructItem,
  createStructItem,
  deleteStruct,
  deleteStructItem,
  renameStruct,
  setStructColor,
  updateStructItem,
} from "@/lib/actions/structs";
import { fuzzyLastDone } from "@/lib/domain/fuzzy-date";
import { byUrgencyDesc, isDue } from "@/lib/domain/urgency";
import type {
  StructDTO,
  StructItemDTO,
  StructLevelDTO,
  WidgetColor,
} from "@/lib/types";

/**
 * The struct widget — recurring reminders on a decay clock. Items are
 * ordered by urgency (most overdue first); once a full recurrence interval
 * has elapsed a checkbox appears, and checking it resets the clock.
 */
export function StructCard({
  struct,
  levels,
  handleProps,
  isDragging,
}: {
  struct: StructDTO;
  levels: StructLevelDTO[];
  handleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}) {
  const dispatch = useBoardDispatch();
  const [adding, setAdding] = useState(false);

  const sortedItems = useMemo(
    () => [...struct.items].sort(byUrgencyDesc()),
    [struct.items],
  );

  return (
    <WidgetChrome
      title={struct.title}
      currentTitle={struct.title}
      color={struct.color}
      handleProps={handleProps}
      isDragging={isDragging}
      onRename={(title) => {
        dispatch({ type: "struct/update", id: struct.id, patch: { title } });
        void renameStruct(struct.id, title);
      }}
      onColorChange={(color: WidgetColor) => {
        dispatch({ type: "struct/update", id: struct.id, patch: { color } });
        void setStructColor(struct.id, color);
      }}
      onRemove={() => {
        dispatch({ type: "struct/remove", id: struct.id });
        void deleteStruct(struct.id);
      }}
      removeLabel="Remove struct"
    >
      <ul className="flex flex-col gap-0.5">
        {sortedItems.map((item) => (
          <StructItemRow key={item.id} structId={struct.id} item={item} levels={levels} />
        ))}
        {sortedItems.length === 0 && !adding && (
          <li className="py-1 text-sm italic opacity-50">
            No reminders yet — add one below.
          </li>
        )}
      </ul>

      {adding ? (
        <StructItemForm
          levels={levels}
          onCancel={() => setAdding(false)}
          onSubmit={async (title, levelId) => {
            setAdding(false);
            const item = await createStructItem(struct.id, { title, levelId });
            dispatch({ type: "struct/item-add", structId: struct.id, item });
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 rounded-md px-2 py-1 text-sm opacity-70 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
        >
          + Add reminder
        </button>
      )}
    </WidgetChrome>
  );
}

function StructItemRow({
  structId,
  item,
  levels,
}: {
  structId: number;
  item: StructItemDTO;
  levels: StructLevelDTO[];
}) {
  const dispatch = useBoardDispatch();
  const [editing, setEditing] = useState(false);
  const due = isDue(item.lastDoneAt, item.levelSeconds);

  const checkOff = () => {
    // Optimistic: reset the clock now; the list re-sorts via urgency.
    dispatch({
      type: "struct/item-update",
      structId,
      itemId: item.id,
      patch: { lastDoneAt: new Date().toISOString() },
    });
    void checkOffStructItem(item.id);
  };

  if (editing) {
    return (
      <li>
        <StructItemForm
          levels={levels}
          initialTitle={item.title}
          initialLevelId={item.levelId}
          onDelete={() => {
            setEditing(false);
            dispatch({ type: "struct/item-remove", structId, itemId: item.id });
            void deleteStructItem(item.id);
          }}
          onCancel={() => setEditing(false)}
          onSubmit={(title, levelId) => {
            setEditing(false);
            const level = levels.find((l) => l.id === levelId);
            dispatch({
              type: "struct/item-update",
              structId,
              itemId: item.id,
              patch: {
                title,
                levelId,
                levelTitle: level?.title ?? item.levelTitle,
                levelSeconds: level?.levelSeconds ?? item.levelSeconds,
              },
            });
            void updateStructItem(item.id, { title, levelId });
          }}
        />
      </li>
    );
  }

  return (
    <li className="group/item flex items-center gap-2 rounded-md px-1 py-1">
      {due ? (
        <input
          type="checkbox"
          checked={false}
          onChange={checkOff}
          className="size-4 shrink-0 accent-current"
          aria-label={`Mark ${item.title} as done`}
        />
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
      <span className="flex-1 text-sm leading-5">
        {item.title}
        {due && (
          <span className="ml-2 rounded-full bg-urgent/15 px-1.5 py-0.5 text-[10px] font-medium text-urgent">
            due
          </span>
        )}
      </span>
      <span
        className="text-xs opacity-50"
        title={new Date(item.lastDoneAt).toLocaleDateString()}
      >
        {fuzzyLastDone(item.lastDoneAt)}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded px-1 text-xs opacity-0 transition-opacity hover:bg-black/10 group-hover/item:opacity-60 focus-visible:opacity-60 dark:hover:bg-white/10"
        aria-label={`Edit ${item.title}`}
      >
        ✎
      </button>
    </li>
  );
}

function StructItemForm({
  levels,
  initialTitle = "",
  initialLevelId,
  onSubmit,
  onCancel,
  onDelete,
}: {
  levels: StructLevelDTO[];
  initialTitle?: string;
  initialLevelId?: number;
  onSubmit: (title: string, levelId: number) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [levelId, setLevelId] = useState(initialLevelId ?? levels[0]?.id ?? 0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (trimmed && levelId) onSubmit(trimmed, levelId);
      }}
      className="mt-1 flex flex-wrap items-center gap-2 rounded-md bg-white/30 p-2 dark:bg-black/20"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        placeholder="What needs doing?"
        aria-label="Reminder title"
        className="min-w-0 flex-1 rounded-md bg-white/50 px-2 py-1 text-sm outline-none placeholder:opacity-50 dark:bg-black/30"
      />
      <select
        value={levelId}
        onChange={(e) => setLevelId(Number(e.target.value))}
        aria-label="Recurrence"
        className="rounded-md bg-white/50 px-1 py-1 text-sm outline-none dark:bg-black/30"
      >
        {levels.map((level) => (
          <option key={level.id} value={level.id}>
            {level.title}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        <button
          type="submit"
          className="rounded-md px-2 py-1 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-2 py-1 text-sm opacity-70 hover:bg-black/10 dark:hover:bg-white/10"
        >
          Cancel
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md px-2 py-1 text-sm text-urgent hover:bg-black/10 dark:hover:bg-white/10"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
