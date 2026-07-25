"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Chapter, ChapterAudioResponse, VerseTiming } from "@/lib/types";
import { findTiming, usePlayer, verseKeyAtMs } from "@/lib/stores/player";
import { useSettings } from "@/lib/stores/settings";
import { onPlayRequest, requestPlay, type PlayRequest } from "@/lib/audio-bus";
import { RECITERS, getReciter } from "@/lib/reciters";
import { parseVerseKey } from "@/lib/utils";
import {
  IconChevronDown,
  IconNext,
  IconPause,
  IconPlay,
  IconPrev,
  IconSpinner,
  IconX,
} from "./icons";

/** Cache respons audio per "reciter:chapter" supaya tak fetch berulang. */
const audioCache = new Map<string, ChapterAudioResponse>();

async function fetchAudio(reciterId: number, chapterId: number): Promise<ChapterAudioResponse> {
  const key = `${reciterId}:${chapterId}`;
  const cached = audioCache.get(key);
  if (cached) return cached;
  const res = await fetch(`/api/audio?reciter=${reciterId}&chapter=${chapterId}`);
  if (!res.ok) throw new Error("audio");
  const data = (await res.json()) as ChapterAudioResponse;
  audioCache.set(key, data);
  return data;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioPlayer({ chapters }: { chapters: Chapter[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const player = usePlayer();
  const reciterId = useSettings((s) => s.reciterId);
  const autoScroll = useSettings((s) => s.autoScroll);
  const setReciter = useSettings((s) => s.setReciter);
  const [reciterOpen, setReciterOpen] = useState(false);

  const chapterName = useCallback(
    (id: number) => chapters.find((c) => c.id === id)?.name_simple ?? `Surah ${id}`,
    [chapters]
  );

  /** Muat (jika perlu) + seek + main satu verse. */
  const handleRequest = useCallback(
    async (req: PlayRequest) => {
      const audio = audioRef.current;
      if (!audio) return;
      const st = usePlayer.getState();

      try {
        let timings: VerseTiming[];
        let audioUrl: string;

        if (st.chapterId === req.chapterId && st.reciterId === reciterId && st.audioUrl) {
          timings = st.timings;
          audioUrl = st.audioUrl;
        } else {
          usePlayer.getState().set({ isLoading: true });
          const data = await fetchAudio(reciterId, req.chapterId);
          const file = data.audio_files[0];
          if (!file) throw new Error("no audio file");
          timings = file.verse_timings;
          audioUrl = file.audio_url;
          usePlayer.getState().load({
            chapterId: req.chapterId,
            reciterId,
            audioUrl,
            timings,
          });
          usePlayer.getState().set({ isLoading: false });
          if (audio.src !== audioUrl) {
            audio.src = audioUrl;
            audio.load();
          }
        }

        const timing = findTiming(timings, req.verseKey);
        if (!timing) return;
        audio.currentTime = timing.timestamp_from / 1000;
        usePlayer.getState().set({
          activeVerseKey: req.verseKey,
          mode: req.mode,
          isPlaying: true,
        });
        await audio.play();
      } catch {
        usePlayer.getState().set({
          isLoading: false,
          isPlaying: false,
          error: "Gagal memuat audio. Cuba qari lain atau semak sambungan.",
        });
      }
    },
    [reciterId]
  );

  useEffect(() => onPlayRequest(handleRequest), [handleRequest]);

  /** Loop utama: masa berjalan → kemas kini verse aktif + highlight + auto-scroll. */
  const onTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const st = usePlayer.getState();
    const ms = audio.currentTime * 1000;
    st.set({ currentTime: audio.currentTime });

    // Mod single: berhenti di hujung ayat.
    if (st.mode === "single" && st.activeVerseKey) {
      const t = findTiming(st.timings, st.activeVerseKey);
      if (t && ms >= t.timestamp_to) {
        audio.pause();
        st.set({ isPlaying: false });
        return;
      }
    }

    const key = verseKeyAtMs(st.timings, ms);
    if (key && key !== st.activeVerseKey) {
      st.set({ activeVerseKey: key });
      if (autoScroll) {
        document
          .getElementById(`ayah-${key}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [autoScroll]);

  const onLoadedMeta = useCallback(() => {
    const audio = audioRef.current;
    if (audio) usePlayer.getState().set({ duration: audio.duration });
  }, []);

  const onEnded = useCallback(() => {
    usePlayer.getState().set({ isPlaying: false, activeVerseKey: null });
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    const st = usePlayer.getState();
    if (!audio || !st.audioUrl) return;
    if (st.isPlaying) {
      audio.pause();
      st.set({ isPlaying: false });
    } else {
      st.set({ isPlaying: true, mode: "continuous" });
      await audio.play().catch(() => st.set({ isPlaying: false }));
    }
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const st = usePlayer.getState();
      if (!st.chapterId || !st.activeVerseKey) return;
      const { verse } = parseVerseKey(st.activeVerseKey);
      const next = verse + dir;
      const targetKey = `${st.chapterId}:${next}`;
      if (!findTiming(st.timings, targetKey)) return;
      requestPlay({
        chapterId: st.chapterId,
        chapterName: chapterName(st.chapterId),
        verseKey: targetKey,
        mode: st.mode,
      });
    },
    [chapterName]
  );

  // Tukar qari semasa main → muat semula pada ayat semasa.
  const changeReciter = useCallback(
    (id: number) => {
      setReciter(id);
      setReciterOpen(false);
      const st = usePlayer.getState();
      if (st.chapterId && st.activeVerseKey) {
        requestPlay({
          chapterId: st.chapterId,
          chapterName: chapterName(st.chapterId),
          verseKey: st.activeVerseKey,
          mode: st.mode,
        });
      }
    },
    [chapterName, setReciter]
  );

  // MediaSession (kawalan skrin kunci)
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
    navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
  }, [togglePlay, step]);

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Number(e.target.value);
  }, []);

  const active = player.chapterId !== null;
  const reciter = getReciter(player.reciterId ?? reciterId);

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMeta}
        onEnded={onEnded}
        onPlay={() => usePlayer.getState().set({ isPlaying: true })}
        onPause={() => usePlayer.getState().set({ isPlaying: false })}
      />

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5 sm:pb-5"
          >
            <div className="glass-strong mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl px-4 py-3 ring-gold-glow">
              <div className="flex items-center gap-3">
                {/* Transport */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => step(-1)}
                    aria-label="Ayat sebelum"
                    className="grid h-9 w-9 place-items-center rounded-full text-fg transition hover:text-gold-2"
                  >
                    <IconPrev size={18} />
                  </button>
                  <button
                    onClick={togglePlay}
                    aria-label={player.isPlaying ? "Jeda" : "Main"}
                    className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-gold-2 ring-gold-glow transition hover:scale-105"
                  >
                    {player.isLoading ? (
                      <IconSpinner size={20} />
                    ) : player.isPlaying ? (
                      <IconPause size={20} />
                    ) : (
                      <IconPlay size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => step(1)}
                    aria-label="Ayat seterusnya"
                    className="grid h-9 w-9 place-items-center rounded-full text-fg transition hover:text-gold-2"
                  >
                    <IconNext size={18} />
                  </button>
                </div>

                {/* Info + reciter */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-fg-strong">
                      {player.chapterId ? chapterName(player.chapterId) : ""}
                      {player.activeVerseKey && (
                        <span className="ml-1.5 font-mono text-xs text-gold-2">
                          {player.activeVerseKey}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setReciterOpen((o) => !o)}
                      className="flex items-center gap-1 text-xs text-muted transition hover:text-fg"
                    >
                      {reciter.name}
                      <IconChevronDown size={13} />
                    </button>
                    <AnimatePresence>
                      {reciterOpen && (
                        <motion.ul
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="glass-strong absolute bottom-full left-0 z-10 mb-2 w-56 overflow-hidden rounded-xl border py-1"
                        >
                          {RECITERS.map((r) => (
                            <li key={r.id}>
                              <button
                                onClick={() => changeReciter(r.id)}
                                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-surface-hover ${
                                  r.id === reciterId ? "text-gold-2" : "text-fg"
                                }`}
                              >
                                <span className="truncate">{r.name}</span>
                                {r.id === reciterId && <span className="text-xs">●</span>}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button
                  onClick={() => {
                    audioRef.current?.pause();
                    usePlayer.getState().reset();
                  }}
                  aria-label="Tutup pemain"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:text-fg"
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2.5">
                <span className="w-9 shrink-0 text-right font-mono text-[11px] text-muted">
                  {fmt(player.currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={player.duration || 0}
                  value={player.currentTime}
                  onChange={seek}
                  aria-label="Kedudukan audio"
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-border-strong accent-[var(--gold-2)]"
                />
                <span className="w-9 shrink-0 font-mono text-[11px] text-muted">
                  {fmt(player.duration)}
                </span>
              </div>

              {player.error && (
                <p className="text-center text-xs text-red-400">{player.error}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
