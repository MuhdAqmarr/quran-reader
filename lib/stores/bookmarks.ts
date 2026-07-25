"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LastRead {
  chapterId: number;
  chapterName: string;
  verseKey: string;
  ts: number;
}

interface BookmarksState {
  /** verse_key → timestamp ditanda */
  bookmarks: Record<string, number>;
  lastRead: LastRead | null;
  toggleBookmark: (verseKey: string) => void;
  setLastRead: (lastRead: LastRead) => void;
}

export const useBookmarks = create<BookmarksState>()(
  persist(
    (set) => ({
      bookmarks: {},
      lastRead: null,
      toggleBookmark: (verseKey) =>
        set((s) => {
          const next = { ...s.bookmarks };
          if (next[verseKey]) {
            delete next[verseKey];
          } else {
            next[verseKey] = Date.now();
          }
          return { bookmarks: next };
        }),
      setLastRead: (lastRead) => set({ lastRead }),
    }),
    { name: "qe-bookmarks" }
  )
);
