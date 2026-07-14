import Link from "next/link";
import { UserButton } from "@neondatabase/auth/react/ui";

import { BoardSwitcher } from "@/components/shell/board-switcher";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { requireUser } from "@/lib/auth/session";
import { getBoards } from "@/lib/db/queries/board";
import { getDueCount } from "@/lib/db/queries/whats-next";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [boards, dueCount] = await Promise.all([
    getBoards(user.id),
    getDueCount(user.id),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-md">
        <Link
          href="/boards"
          className="font-display text-3xl leading-none text-ink"
        >
          bStruct
        </Link>

        <BoardSwitcher boards={boards} />

        <nav className="ml-auto flex items-center gap-2">
          <Link
            href="/next"
            className="relative rounded-lg border border-line bg-surface px-3 py-1.5 text-sm shadow-sm transition-colors hover:bg-surface-muted"
          >
            What’s next
            {dueCount > 0 && (
              <span
                className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-urgent px-1 text-[11px] font-semibold text-white"
                aria-label={`${dueCount} reminders due`}
              >
                {dueCount > 99 ? "99+" : dueCount}
              </span>
            )}
          </Link>
          <ThemeToggle />
          <UserButton size="icon" />
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
