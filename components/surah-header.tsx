"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Chapter } from "@/lib/types";
import { useSettings, type ArabicScale } from "@/lib/stores/settings";
import { usePlayer } from "@/lib/stores/player";
import { requestControl, requestPlay } from "@/lib/audio-bus";
import { revelationPlaceMs } from "@/lib/utils";
import { SurahFrame, SurahNameCalligraphy, OrnamentDivider } from "./ornaments";
import { IconBookOpen, IconPause, IconPlay } from "./icons";

/** Surah tanpa bismillah header: Al-Faatihah (1, ia ayat 1:1) & At-Tawbah (9). */
const NO_BISMILLAH = new Set([1, 9]);

export function SurahHeader({ chapter }: { chapter: Chapter }) {
  const scale = useSettings((s) => s.arabicScale);
  const setScale = useSettings((s) => s.setArabicScale);
  const showEnglish = useSettings((s) => s.showEnglish);
  const setShowEnglish = useSettings((s) => s.setShowEnglish);

  const playingThisSurah = usePlayer(
    (s) => s.chapterId === chapter.id && s.isPlaying
  );

  const playSurah = () => {
    if (playingThisSurah) {
      requestControl("pause");
    } else {
      requestPlay({
        chapterId: chapter.id,
        chapterName: chapter.name_simple,
        verseKey: `${chapter.id}:1`,
        mode: "continuous",
      });
    }
  };

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SurahFrame className="glass-card rounded-3xl">
          <div className="text-center">
            <SurahNameCalligraphy
              id={chapter.id}
              className="text-6xl leading-none text-gold-gradient sm:text-7xl"
            />
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-fg-strong">
              {chapter.name_simple}
            </h1>
            <p className="mt-1 text-muted">{chapter.translated_name.name}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Chip>{revelationPlaceMs(chapter.revelation_place)}</Chip>
              <Chip>{chapter.verses_count} Ayat</Chip>
              <Chip>Muka Surat {chapter.pages[0]}</Chip>
            </div>
          </div>
        </SurahFrame>
      </motion.div>

      {/* Toolbar bacaan */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={playSurah}
          className="glass-strong inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-fg-strong ring-gold-glow transition hover:-translate-y-0.5"
        >
          {playingThisSurah ? (
            <IconPause size={16} className="text-gold-2" />
          ) : (
            <IconPlay size={16} className="text-gold-2" />
          )}
          {playingThisSurah ? "Jeda" : "Dengar Surah"}
        </button>

        <Link
          href={`/mushaf/${chapter.pages[0]}`}
          className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-fg transition hover:text-gold-2"
        >
          <IconBookOpen size={16} />
          Mod Baca
        </Link>

        <div className="glass-card inline-flex items-center gap-1 rounded-full px-1.5 py-1">
          {([1, 2, 3] as ArabicScale[]).map((sz) => (
            <button
              key={sz}
              onClick={() => setScale(sz)}
              aria-label={`Saiz teks ${sz}`}
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition ${
                scale === sz ? "bg-gold-soft text-gold-2" : "text-muted hover:text-fg"
              }`}
            >
              <span style={{ fontSize: `${0.7 + sz * 0.12}rem` }}>ﺍ</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowEnglish(!showEnglish)}
          className={`glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
            showEnglish ? "text-gold-2 ring-gold-glow" : "text-muted hover:text-fg"
          }`}
        >
          EN
        </button>
      </div>

      {!NO_BISMILLAH.has(chapter.id) && (
        <div className="mt-8 text-center">
          <p
            className="font-uthmanic text-3xl text-fg-strong sm:text-4xl"
            dir="rtl"
            translate="no"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <OrnamentDivider className="mx-auto mt-6 max-w-xs" />
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass-card rounded-full px-3 py-1 text-xs font-medium text-fg">
      {children}
    </span>
  );
}
