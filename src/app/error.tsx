"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-display text-4xl">Something fell off the board</h1>
      <p className="max-w-md text-sm text-ink-muted">
        {error.digest ? `Error reference: ${error.digest}` : error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-line bg-surface px-4 py-2 text-sm shadow-sm hover:bg-surface-muted"
      >
        Try again
      </button>
    </main>
  );
}
