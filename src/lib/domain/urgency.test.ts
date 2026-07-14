import { describe, expect, it } from "vitest";

import { byUrgencyDesc, isDue, secondsUntilDue, urgency } from "./urgency";

const NOW = new Date("2026-07-14T12:00:00Z");
const DAY = 86_400;
const WEEK = 7 * DAY;

function ago(seconds: number): Date {
  return new Date(NOW.getTime() - seconds * 1000);
}

describe("urgency", () => {
  it("is 0 when just done", () => {
    expect(urgency(NOW, DAY, NOW)).toBe(0);
  });

  it("is 1 exactly one interval after last done", () => {
    expect(urgency(ago(DAY), DAY, NOW)).toBeCloseTo(1);
    expect(urgency(ago(WEEK), WEEK, NOW)).toBeCloseTo(1);
  });

  it("scales linearly with elapsed time (the decay ratio)", () => {
    expect(urgency(ago(3 * DAY), DAY, NOW)).toBeCloseTo(3);
    expect(urgency(ago(DAY), WEEK, NOW)).toBeCloseTo(1 / 7);
  });

  it("accepts ISO strings", () => {
    expect(urgency(ago(DAY).toISOString(), DAY, NOW)).toBeCloseTo(1);
  });
});

describe("isDue", () => {
  it("matches the legacy condition: level_time < elapsed", () => {
    expect(isDue(ago(DAY + 1), DAY, NOW)).toBe(true);
    expect(isDue(ago(DAY - 60), DAY, NOW)).toBe(false);
  });
});

describe("secondsUntilDue", () => {
  it("counts down to the next due moment", () => {
    expect(secondsUntilDue(ago(DAY), 2 * DAY, NOW)).toBeCloseTo(DAY);
  });

  it("goes negative when overdue", () => {
    expect(secondsUntilDue(ago(3 * DAY), DAY, NOW)).toBeCloseTo(-2 * DAY);
  });
});

describe("byUrgencyDesc", () => {
  it("floats the most overdue to the top (legacy item_order DESC)", () => {
    const items = [
      { id: "fresh-daily", lastDoneAt: ago(60), levelSeconds: DAY },
      { id: "overdue-weekly", lastDoneAt: ago(3 * WEEK), levelSeconds: WEEK },
      { id: "due-daily", lastDoneAt: ago(2 * DAY), levelSeconds: DAY },
    ];
    const sorted = [...items].sort(byUrgencyDesc(NOW));
    expect(sorted.map((i) => i.id)).toEqual([
      "overdue-weekly", // urgency 3
      "due-daily", // urgency 2
      "fresh-daily", // urgency ~0
    ]);
  });
});
