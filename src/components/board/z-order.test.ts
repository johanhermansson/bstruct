import { describe, expect, it } from "vitest";

import { changedZ, denseZ, liftKey } from "./z-order";

describe("z-order normalization", () => {
  it("lifting moves a key to the top and keeps z dense 1..N", () => {
    const order = ["note:1", "todo:2", "struct:3"];
    const lifted = liftKey(order, "note:1");

    expect(lifted).toEqual(["todo:2", "struct:3", "note:1"]);
    expect(denseZ(lifted, "todo:2")).toBe(1);
    expect(denseZ(lifted, "struct:3")).toBe(2);
    expect(denseZ(lifted, "note:1")).toBe(3);
  });

  it("lifting the top widget is a no-op ordering", () => {
    const order = ["a", "b", "c"];
    expect(liftKey(order, "c")).toEqual(order);
  });

  it("reports exactly the widgets whose z changed", () => {
    const prev = ["a", "b", "c"];
    const next = liftKey(prev, "a"); // b,c,a — every z changed
    expect(changedZ(prev, next)).toEqual(["b", "c", "a"]);

    const next2 = liftKey(prev, "b"); // a,c,b — a keeps z=1
    expect(changedZ(prev, next2)).toEqual(["c", "b"]);
  });

  it("z never exceeds the widget count (no unbounded creep)", () => {
    let order = ["a", "b", "c", "d"];
    for (let i = 0; i < 50; i++) {
      order = liftKey(order, order[i % 4]);
    }
    const zs = order.map((k) => denseZ(order, k)).sort();
    expect(zs).toEqual([1, 2, 3, 4]);
  });
});
