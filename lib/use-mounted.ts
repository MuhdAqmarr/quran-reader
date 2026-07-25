"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hydration-safe: false semasa SSR/hydration awal, true selepas mount di client.
 * Guna untuk elak mismatch tanpa setState-dalam-effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
