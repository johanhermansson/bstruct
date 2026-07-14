"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";

import { stickySwatch } from "@/components/widgets/widget-chrome";
import { checkOffStructItem } from "@/lib/actions/structs";
import { dueInLabel, fuzzyLastDone } from "@/lib/domain/fuzzy-date";
import type { UpNextItem } from "@/lib/types";

/**
 * Cross-board overview of every recurring reminder, ordered by urgency
 * (elapsed / interval). Urgency >= 1 means due now; the rest are coming up.
 */
export function WhatsNextView({ items }: { items: UpNextItem[] }) {
  const [optimisticItems, markDone] = useOptimistic(
    items,
    (current, itemId: number) =>
      current.map((item) =>
        item.itemId === itemId
          ? { ...item, urgency: 0, lastDoneAt: new Date().toISOString() }
          : item,
      ),
  );
  const [, startTransition] = useTransition();

  const due = optimisticItems
    .filter((item) => item.urgency >= 1)
    .sort((a, b) => b.urgency - a.urgency);
  const upcoming = optimisticItems
    .filter((item) => item.urgency < 1)
    .sort((a, b) => b.urgency - a.urgency);

  const checkOff = (itemId: number) => {
    startTransition(async () => {
      markDone(itemId);
      await checkOffStructItem(itemId);
    });
  };

  if (optimisticItems.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center text-ink-muted">
        <p className="font-display text-3xl">Nothing on the horizon</p>
        <p className="mt-2 text-sm">
          Add reminders to a struct on your{" "}
          <Link href="/boards" className="underline">
            board
          </Link>{" "}
          and they’ll queue up here by urgency.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      <section aria-labelledby="due-now">
        <h1
          id="due-now"
          className="mb-3 flex items-center gap-2 font-display text-3xl"
        >
          Due now
          {due.length > 0 && (
            <span className="rounded-full bg-urgent px-2 py-0.5 text-sm font-sans font-semibold text-white">
              {due.length}
            </span>
          )}
        </h1>
        {due.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted">
            All caught up — nothing is due right now. 🎉
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {due.map((item) => (
              <UpNextRow
                key={item.itemId}
                item={item}
                onCheckOff={() => checkOff(item.itemId)}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="coming-up">
        <h2 id="coming-up" className="mb-3 font-display text-3xl">
          Coming up
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted">
            Nothing scheduled further out.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((item) => (
              <UpNextRow key={item.itemId} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function UpNextRow({
  item,
  onCheckOff,
}: {
  item: UpNextItem;
  onCheckOff?: () => void;
}) {
  const secondsUntil = (1 - item.urgency) * item.levelSeconds;

  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm">
      {onCheckOff ? (
        <input
          type="checkbox"
          checked={false}
          onChange={onCheckOff}
          className="size-5 shrink-0 accent-current"
          aria-label={`Mark ${item.title} as done`}
        />
      ) : (
        <span
          className={`size-2.5 shrink-0 rounded-full ${stickySwatch[item.color]}`}
          aria-hidden
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="truncate text-xs text-ink-muted">
          <Link href={`/boards/${item.boardId}`} className="hover:underline">
            {item.structTitle}
          </Link>{" "}
          · {item.levelTitle.toLowerCase()} · last done{" "}
          {fuzzyLastDone(item.lastDoneAt).toLowerCase()}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
          onCheckOff
            ? "bg-urgent/15 text-urgent"
            : "bg-surface-muted text-ink-muted"
        }`}
      >
        {onCheckOff
          ? `${Math.round(item.urgency * 100)}% over`
          : dueInLabel(secondsUntil)}
      </span>
    </li>
  );
}
