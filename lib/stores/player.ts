"use client";

import { create } from "zustand";
import type { VerseTiming } from "@/lib/types";

export type PlayMode = "single" | "continuous";

interface PlayerState {
  /** Surah yang audionya dimuatkan. */
  chapterId: number | null;
  reciterId: number | null;
  audioUrl: string | null;
  timings: VerseTiming[];
  /** verse_key yang sedang dibaca. */
  activeVerseKey: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  mode: PlayMode;
  duration: number;
  currentTime: number;
  error: string | null;

  load: (p: {
    chapterId: number;
    reciterId: number;
    audioUrl: string;
    timings: VerseTiming[];
  }) => void;
  reset: () => void;
  set: (patch: Partial<PlayerState>) => void;
}

const initial = {
  chapterId: null,
  reciterId: null,
  audioUrl: null,
  timings: [],
  activeVerseKey: null,
  isPlaying: false,
  isLoading: false,
  mode: "continuous" as PlayMode,
  duration: 0,
  currentTime: 0,
  error: null,
};

export const usePlayer = create<PlayerState>((set) => ({
  ...initial,
  load: ({ chapterId, reciterId, audioUrl, timings }) =>
    set({ chapterId, reciterId, audioUrl, timings, error: null }),
  reset: () => set({ ...initial }),
  set: (patch) => set(patch),
}));

/** Cari timing untuk verse_key tertentu. */
export function findTiming(timings: VerseTiming[], verseKey: string): VerseTiming | undefined {
  return timings.find((t) => t.verse_key === verseKey);
}

/** Binary search: masa (ms) → verse_key yang sedang dibaca. */
export function verseKeyAtMs(timings: VerseTiming[], ms: number): string | null {
  let lo = 0;
  let hi = timings.length - 1;
  let ans: string | null = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = timings[mid];
    if (ms < t.timestamp_from) {
      hi = mid - 1;
    } else if (ms > t.timestamp_to) {
      lo = mid + 1;
    } else {
      ans = t.verse_key;
      break;
    }
  }
  return ans;
}
