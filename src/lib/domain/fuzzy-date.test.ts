import { describe, expect, it } from "vitest";

import { dueInLabel, fuzzyLastDone } from "./fuzzy-date";

// Fixed noon reference keeps calendar-day comparisons stable.
const NOW = new Date("2026-07-14T12:00:00");
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 2_629_744_000;
const YEAR = 31_556_926_000;

function ago(ms: number): Date {
  return new Date(NOW.getTime() - ms);
}

describe("fuzzyLastDone — the 11 legacy buckets", () => {
  it("never done", () => {
    expect(fuzzyLastDone(null, NOW)).toBe("–");
  });

  it("Today: same calendar day", () => {
    expect(fuzzyLastDone(ago(2 * HOUR), NOW)).toBe("Today");
    expect(fuzzyLastDone(new Date("2026-07-14T00:30:00"), NOW)).toBe("Today");
  });

  it("Yesterday: previous calendar day", () => {
    expect(fuzzyLastDone(new Date("2026-07-13T23:00:00"), NOW)).toBe(
      "Yesterday",
    );
    expect(fuzzyLastDone(new Date("2026-07-13T01:00:00"), NOW)).toBe(
      "Yesterday",
    );
  });

  it("Few days ago: within a week", () => {
    expect(fuzzyLastDone(ago(3 * DAY), NOW)).toBe("Few days ago");
    expect(fuzzyLastDone(ago(6 * DAY), NOW)).toBe("Few days ago");
  });

  it("A week ago: ±3 days around one week", () => {
    expect(fuzzyLastDone(ago(WEEK + HOUR), NOW)).toBe("A week ago");
    expect(fuzzyLastDone(ago(WEEK + 2 * DAY), NOW)).toBe("A week ago");
  });

  it("Over a week ago: beyond the ±3d window but under two weeks", () => {
    expect(fuzzyLastDone(ago(WEEK + 3 * DAY + HOUR), NOW)).toBe(
      "Over a week ago",
    );
  });

  it("Weeks ago: two to four weeks", () => {
    expect(fuzzyLastDone(ago(3 * WEEK), NOW)).toBe("Weeks ago");
  });

  it("A month ago: ±1 week around one month", () => {
    expect(fuzzyLastDone(ago(MONTH), NOW)).toBe("A month ago");
    expect(fuzzyLastDone(ago(MONTH + 6 * DAY), NOW)).toBe("A month ago");
  });

  it("Over a month ago: beyond the window, under three months", () => {
    expect(fuzzyLastDone(ago(2 * MONTH), NOW)).toBe("Over a month ago");
  });

  it("Months ago: three months to nine months", () => {
    expect(fuzzyLastDone(ago(5 * MONTH), NOW)).toBe("Months ago");
  });

  it("A year ago: ±3 months around one year", () => {
    expect(fuzzyLastDone(ago(YEAR), NOW)).toBe("A year ago");
    expect(fuzzyLastDone(ago(YEAR + 2 * MONTH), NOW)).toBe("A year ago");
  });

  it("A long time ago: beyond the year window", () => {
    expect(fuzzyLastDone(ago(2 * YEAR), NOW)).toBe("A long time ago");
  });
});

describe("dueInLabel", () => {
  it("due now at or past zero", () => {
    expect(dueInLabel(0)).toBe("due now");
    expect(dueInLabel(-500)).toBe("due now");
  });

  it("hours under a day", () => {
    expect(dueInLabel(3 * 3600)).toBe("due in ~3 hours");
    expect(dueInLabel(600)).toBe("due in ~1 hour");
  });

  it("days under two weeks", () => {
    expect(dueInLabel(3 * 86_400)).toBe("due in ~3 days");
    expect(dueInLabel(86_400)).toBe("due in ~1 day");
  });

  it("weeks under two months", () => {
    expect(dueInLabel(21 * 86_400)).toBe("due in ~3 weeks");
  });

  it("months beyond", () => {
    expect(dueInLabel(90 * 86_400)).toBe("due in ~3 months");
  });
});
