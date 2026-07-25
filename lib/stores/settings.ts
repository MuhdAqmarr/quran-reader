"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_RECITER_ID } from "@/lib/reciters";

export type ArabicScale = 1 | 2 | 3;

interface SettingsState {
  reciterId: number;
  showEnglish: boolean;
  arabicScale: ArabicScale;
  autoScroll: boolean;
  setReciter: (id: number) => void;
  setShowEnglish: (v: boolean) => void;
  setArabicScale: (v: ArabicScale) => void;
  setAutoScroll: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      reciterId: DEFAULT_RECITER_ID,
      showEnglish: false,
      arabicScale: 2,
      autoScroll: true,
      setReciter: (reciterId) => set({ reciterId }),
      setShowEnglish: (showEnglish) => set({ showEnglish }),
      setArabicScale: (arabicScale) => set({ arabicScale }),
      setAutoScroll: (autoScroll) => set({ autoScroll }),
    }),
    { name: "qe-settings" }
  )
);
