"use client";

import { useState } from "react";

import { WidgetChrome } from "./widget-chrome";
import { useBoardDispatch } from "@/components/board/board-store";
import { deleteNote, setNoteColor, updateNoteContent } from "@/lib/actions/notes";
import { runAction } from "@/lib/actions/run-action";
import type { NoteDTO, WidgetColor } from "@/lib/types";

const MAX_LENGTH = 5_000;

export function NoteCard({
  note,
  handleProps,
  isDragging,
}: {
  note: NoteDTO;
  handleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}) {
  const dispatch = useBoardDispatch();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);

  const commit = () => {
    setEditing(false);
    if (draft === note.content) return;
    dispatch({ type: "note/update", id: note.id, patch: { content: draft } });
    void runAction(() => updateNoteContent(note.id, draft));
  };

  const changeColor = (color: WidgetColor) => {
    dispatch({ type: "note/update", id: note.id, patch: { color } });
    void runAction(() => setNoteColor(note.id, color));
  };

  const remove = () => {
    dispatch({ type: "note/remove", id: note.id });
    void runAction(() => deleteNote(note.id));
  };

  return (
    <WidgetChrome
      title="Note"
      color={note.color}
      handleProps={handleProps}
      isDragging={isDragging}
      onColorChange={changeColor}
      onRemove={remove}
      removeLabel="Remove note"
    >
      {editing ? (
        <div>
          <textarea
            autoFocus
            value={draft}
            maxLength={MAX_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setDraft(note.content);
                setEditing(false);
              }
            }}
            rows={Math.min(14, Math.max(4, draft.split("\n").length + 1))}
            className="w-full resize-none rounded-md bg-white/40 p-2 text-sm leading-6 outline-none dark:bg-black/20"
            aria-label="Note content"
          />
          <p className="mt-1 text-right text-[10px] opacity-60">
            {draft.length}/{MAX_LENGTH}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(note.content);
            setEditing(true);
          }}
          className="block min-h-16 w-full whitespace-pre-wrap rounded-md p-1 text-left text-sm leading-6 hover:bg-black/5 dark:hover:bg-white/5"
        >
          {note.content || (
            <span className="italic opacity-50">Tap to write…</span>
          )}
        </button>
      )}
    </WidgetChrome>
  );
}
