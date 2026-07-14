/**
 * Fuzzy "last done" labels — a direct port of the legacy
 * `struct_parse_date()` (application/helpers/struct_helper.php), which
 * classified a timestamp into 11 human buckets rather than exact durations.
 */

const DAY = 86_400_000;
const WEEK = 7 * DAY;
// Legacy used strtotime('-1 month') / ('-3 month') / ('-1 year'); we use the
// same average-month constant as the recurrence levels (30.44 days).
const MONTH = 2_629_744_000;
const YEAR = 31_556_926_000;

export function fuzzyLastDone(
  lastDoneAt: Date | string | null,
  now: Date = new Date(),
): string {
  if (!lastDoneAt) return "–";

  const time = (
    typeof lastDoneAt === "string" ? new Date(lastDoneAt) : lastDoneAt
  ).getTime();
  const ref = now.getTime();

  if (sameCalendarDay(time, ref)) return "Today";
  if (sameCalendarDay(time, ref - DAY)) return "Yesterday";
  if (time > ref - WEEK) return "Few days ago";
  if (time < ref - WEEK + 3 * DAY && time > ref - WEEK - 3 * DAY)
    return "A week ago";
  if (time > ref - 2 * WEEK) return "Over a week ago";
  if (time > ref - 4 * WEEK) return "Weeks ago";
  if (time < ref - MONTH + WEEK && time > ref - MONTH - WEEK)
    return "A month ago";
  if (time > ref - 3 * MONTH) return "Over a month ago";
  if (time > ref - (YEAR - 3 * MONTH)) return "Months ago";
  if (time < ref - YEAR + 3 * MONTH && time > ref - YEAR - 3 * MONTH)
    return "A year ago";
  return "A long time ago";
}

function sameCalendarDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** Human copy for the What's-next view: "due in ~3 days", "due now". */
export function dueInLabel(secondsUntilDue: number): string {
  if (secondsUntilDue <= 0) return "due now";

  const days = secondsUntilDue / 86_400;
  if (days < 1) {
    const hours = Math.max(1, Math.round(secondsUntilDue / 3_600));
    return `due in ~${hours} hour${hours === 1 ? "" : "s"}`;
  }
  if (days < 14) {
    const d = Math.round(days);
    return `due in ~${d} day${d === 1 ? "" : "s"}`;
  }
  if (days < 60) {
    const w = Math.round(days / 7);
    return `due in ~${w} week${w === 1 ? "" : "s"}`;
  }
  const m = Math.round(days / 30.44);
  return `due in ~${m} month${m === 1 ? "" : "s"}`;
}
