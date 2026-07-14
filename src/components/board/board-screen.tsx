"use client";

import { useMemo, useState } from "react";

import {
  BoardStoreProvider,
  useBoardDispatch,
  useBoardState,
} from "./board-store";
import { BoardView } from "./board-view";
import { StackView } from "@/components/stack/stack-view";
import { useMedia } from "@/hooks/use-media";
import { createNote } from "@/lib/actions/notes";
import { runAction } from "@/lib/actions/run-action";
import { createStruct } from "@/lib/actions/structs";
import { createTodoList } from "@/lib/actions/todos";
import type { BoardData, StructLevelDTO } from "@/lib/types";

/**
 * Client shell for one board: shared optimistic store + add-widget toolbar,
 * rendered as a free-form board on desktop and a stack of cards on mobile.
 * Both views share the same store, so rotating a tablet or resizing keeps
 * in-flight state.
 */
export function BoardScreen({
  data,
  levels,
}: {
  data: BoardData;
  levels: StructLevelDTO[];
}) {
  return (
    <BoardStoreProvider data={data}>
      <Toolbar levels={levels} />
      <ResponsiveBoard levels={levels} />
    </BoardStoreProvider>
  );
}

function ResponsiveBoard({ levels }: { levels: StructLevelDTO[] }) {
  const isDesktop = useMedia("(min-width: 1024px)");

  // Before hydration settles, render both with CSS visibility so there is
  // no flash; afterwards mount only the active view.
  if (isDesktop === undefined) {
    return (
      <>
        <div className="hidden lg:block">
          <BoardView levels={levels} />
        </div>
        <div className="lg:hidden">
          <StackView levels={levels} />
        </div>
      </>
    );
  }

  return isDesktop ? <BoardView levels={levels} /> : <StackView levels={levels} />;
}

function Toolbar({ levels }: { levels: StructLevelDTO[] }) {
  const state = useBoardState();
  const dispatch = useBoardDispatch();
  const [structTitle, setStructTitle] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widgetCount =
    state.notes.length + state.todoLists.length + state.structs.length;

  // Stagger new widgets so they don't pile up exactly on top of each other.
  const spawnPosition = useMemo(
    () => ({
      x: 40 + (widgetCount % 6) * 48,
      y: 40 + (widgetCount % 6) * 32,
      z: state.zOrder.length + 1,
    }),
    [widgetCount, state.zOrder.length],
  );

  const addNote = async () => {
    setBusy(true);
    setError(null);
    try {
      const note = await runAction(() =>
        createNote(state.boardId, spawnPosition),
      );
      dispatch({ type: "note/add", note });
    } catch {
      setError("Couldn’t add the note. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const addTodo = async () => {
    setBusy(true);
    setError(null);
    try {
      const list = await runAction(() =>
        createTodoList(state.boardId, "Todo", spawnPosition),
      );
      dispatch({ type: "todo/add", list });
    } catch {
      setError("Couldn’t add the todo list. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const addStruct = async (title: string) => {
    setBusy(true);
    setError(null);
    try {
      const struct = await runAction(() =>
        createStruct(state.boardId, title, spawnPosition),
      );
      dispatch({ type: "struct/add", struct });
      setStructTitle(null);
    } catch {
      setError("Couldn’t add the struct. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sticky top-14 z-40 flex flex-wrap items-center gap-2 border-b border-line bg-canvas/80 px-4 py-2 backdrop-blur-md">
      <span className="mr-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
        Add
      </span>
      <ToolbarButton onClick={() => void addNote()} disabled={busy}>
        + Note
      </ToolbarButton>
      <ToolbarButton onClick={() => void addTodo()} disabled={busy}>
        + Todo list
      </ToolbarButton>

      {structTitle === null ? (
        <ToolbarButton
          onClick={() => setStructTitle("")}
          disabled={busy || levels.length === 0}
          title={
            levels.length === 0
              ? "Recurrence levels missing — run the database seed"
              : undefined
          }
        >
          + Struct
        </ToolbarButton>
      ) : (
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = structTitle.trim();
            if (trimmed) void addStruct(trimmed);
          }}
        >
          <input
            autoFocus
            value={structTitle}
            onChange={(e) => setStructTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setStructTitle(null);
            }}
            placeholder="Struct name, e.g. Cleaning"
            aria-label="New struct name"
            className="rounded-md border border-line bg-surface px-2 py-1 text-sm outline-none"
          />
          <ToolbarButton type="submit" disabled={busy}>
            Create
          </ToolbarButton>
          <ToolbarButton onClick={() => setStructTitle(null)}>
            Cancel
          </ToolbarButton>
        </form>
      )}

      {error && (
        <span role="alert" className="text-xs font-medium text-urgent">
          {error}
        </span>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="rounded-lg border border-line bg-surface px-2.5 py-1 text-sm text-ink shadow-sm transition-colors hover:bg-surface-muted disabled:opacity-50"
    >
      {children}
    </button>
  );
}
