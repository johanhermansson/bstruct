"use client";

import { updatePositions } from "@/lib/actions/positions";
import type { PositionPatch, WidgetKind } from "@/lib/types";

const FLUSH_DELAY_MS = 800;

/**
 * Collapses rapid drags into one batched updatePositions call (the legacy
 * app did the same with its `dash/positions` endpoint). If the page hides
 * before the timer fires, the pending batch goes out via sendBeacon.
 */
class PositionBuffer {
  private patches = new Map<string, PositionPatch>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private listenersBound = false;

  push(kind: WidgetKind, id: number, x: number, y: number, z: number) {
    this.patches.set(`${kind}:${id}`, { kind, id, x, y, z });
    this.schedule();
  }

  private schedule() {
    this.bindLifecycleListeners();
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), FLUSH_DELAY_MS);
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.patches.size === 0) return;

    const batch = [...this.patches.values()];
    this.patches.clear();

    try {
      await updatePositions(batch);
    } catch {
      // Re-queue so the next drag or page-hide retries the batch.
      for (const patch of batch) {
        const key = `${patch.kind}:${patch.id}`;
        if (!this.patches.has(key)) this.patches.set(key, patch);
      }
      this.schedule();
    }
  }

  /** Fire-and-forget flush for pagehide — server actions can't be used. */
  private flushWithBeacon() {
    if (this.patches.size === 0) return;
    const batch = [...this.patches.values()];
    this.patches.clear();
    navigator.sendBeacon(
      "/api/positions",
      new Blob([JSON.stringify(batch)], { type: "application/json" }),
    );
  }

  private bindLifecycleListeners() {
    if (this.listenersBound || typeof window === "undefined") return;
    this.listenersBound = true;

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flushWithBeacon();
    });
    window.addEventListener("pagehide", () => this.flushWithBeacon());
  }
}

export const positionBuffer = new PositionBuffer();
