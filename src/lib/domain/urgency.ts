/**
 * The struct recurrence model is a *decay* model, not calendar scheduling
 * (ported from the legacy `struct_model.php` ordering query):
 *
 *   urgency = seconds since last done / recurrence interval in seconds
 *
 * - Items sort by urgency descending: the most overdue float to the top.
 * - An item is *due* once a full interval has elapsed (urgency >= 1),
 *   which is when the check-off checkbox appears.
 * - Checking an item off resets its clock (lastDoneAt = now).
 *
 * This module is the client-side mirror of the SQL expression
 *   EXTRACT(EPOCH FROM (now() - last_done_at)) / level_seconds
 * so optimistic updates can re-sort without a round trip.
 */

export function urgency(
  lastDoneAt: Date | string,
  levelSeconds: number,
  now: Date = new Date(),
): number {
  const last =
    typeof lastDoneAt === "string" ? new Date(lastDoneAt) : lastDoneAt;
  const elapsedSeconds = (now.getTime() - last.getTime()) / 1000;
  return elapsedSeconds / levelSeconds;
}

/** Legacy due condition: level_time < (now - date_updated). */
export function isDue(
  lastDoneAt: Date | string,
  levelSeconds: number,
  now: Date = new Date(),
): boolean {
  return urgency(lastDoneAt, levelSeconds, now) > 1;
}

/**
 * Seconds until the item becomes due (negative when already overdue).
 * Used by the What's-next view for "due in ~X" copy.
 */
export function secondsUntilDue(
  lastDoneAt: Date | string,
  levelSeconds: number,
  now: Date = new Date(),
): number {
  return (1 - urgency(lastDoneAt, levelSeconds, now)) * levelSeconds;
}

export function byUrgencyDesc<
  T extends { lastDoneAt: Date | string; levelSeconds: number },
>(now: Date = new Date()) {
  return (a: T, b: T) =>
    urgency(b.lastDoneAt, b.levelSeconds, now) -
    urgency(a.lastDoneAt, a.levelSeconds, now);
}
