/**
 * Widget stacking order as a plain list of keys, bottom → top.
 * The persisted z of a widget is its index + 1 — always dense 1..N, so z
 * values never creep upward the way the legacy board's did.
 */

export function liftKey<K>(zOrder: readonly K[], key: K): K[] {
  if (zOrder[zOrder.length - 1] === key) return [...zOrder];
  return [...zOrder.filter((k) => k !== key), key];
}

export function denseZ<K>(zOrder: readonly K[], key: K): number {
  return zOrder.indexOf(key) + 1;
}

/** Keys whose derived z changed between two orderings. */
export function changedZ<K>(prev: readonly K[], next: readonly K[]): K[] {
  return next.filter((key, index) => prev.indexOf(key) !== index);
}
