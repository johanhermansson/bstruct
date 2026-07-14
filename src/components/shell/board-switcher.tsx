"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { createBoard, deleteBoard, renameBoard } from "@/lib/actions/boards";
import { runAction } from "@/lib/actions/run-action";
import type { BoardSummary } from "@/lib/types";

export function BoardSwitcher({ boards }: { boards: BoardSummary[] }) {
  const router = useRouter();
  const params = useParams<{ boardId?: string }>();
  const activeId = params.boardId ? Number(params.boardId) : boards[0]?.id;
  const active = boards.find((b) => b.id === activeId);

  const [mode, setMode] = useState<"idle" | "create" | "rename">("idle");
  const [draft, setDraft] = useState("");

  if (mode !== "idle") {
    const isCreate = mode === "create";
    return (
      <form
        className="flex items-center gap-1"
        onSubmit={async (e) => {
          e.preventDefault();
          const title = draft.trim();
          setMode("idle");
          if (!title) return;
          if (isCreate) {
            await runAction(() => createBoard(title));
          } else if (active) {
            await runAction(() => renameBoard(active.id, title));
            router.refresh();
          }
        }}
      >
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMode("idle");
          }}
          placeholder={isCreate ? "New board name" : "Rename board"}
          aria-label={isCreate ? "New board name" : "Rename board"}
          className="w-44 rounded-md border border-line bg-surface px-2 py-1 text-sm outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-line bg-surface px-2 py-1 text-sm hover:bg-surface-muted"
        >
          Save
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <label htmlFor="board-select" className="sr-only">
        Board
      </label>
      <select
        id="board-select"
        value={activeId ?? ""}
        onChange={(e) => router.push(`/boards/${e.target.value}`)}
        className="max-w-44 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm shadow-sm outline-none"
      >
        {boards.map((board) => (
          <option key={board.id} value={board.id}>
            {board.title}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => {
          setDraft("");
          setMode("create");
        }}
        className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm shadow-sm hover:bg-surface-muted"
        title="New board"
        aria-label="New board"
      >
        +
      </button>

      {active && (
        <button
          type="button"
          onClick={() => {
            setDraft(active.title);
            setMode("rename");
          }}
          className="hidden rounded-lg px-1.5 py-1.5 text-sm text-ink-muted hover:bg-surface-muted sm:block"
          title="Rename board"
          aria-label="Rename board"
        >
          ✎
        </button>
      )}

      {active && boards.length > 1 && (
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `Delete board “${active.title}” and everything on it?`,
              )
            ) {
              void runAction(() => deleteBoard(active.id));
            }
          }}
          className="hidden rounded-lg px-1.5 py-1.5 text-sm text-ink-muted hover:bg-surface-muted hover:text-urgent sm:block"
          title="Delete board"
          aria-label="Delete board"
        >
          🗑
        </button>
      )}
    </div>
  );
}
