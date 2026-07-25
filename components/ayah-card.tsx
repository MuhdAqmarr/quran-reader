"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import type { Verse } from "@/lib/types";
import { TRANSLATION_EN, TRANSLATION_MS } from "@/lib/constants";
import { usePlayer } from "@/lib/stores/player";
import { useSettings } from "@/lib/stores/settings";
import { useBookmarks } from "@/lib/stores/bookmarks";
import { requestControl, requestPlay } from "@/lib/audio-bus";
import { cn, stripFootnotes } from "@/lib/utils";
import { QuranWords } from "./quran-words";
import { TafsirSheet } from "./tafsir-sheet";
import { StarNumber } from "./ornaments";
import {
  IconBookmark,
  IconBookOpen,
  IconCheck,
  IconCopy,
  IconPause,
  IconPlay,
} from "./icons";

function ActionButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full transition",
        active ? "bg-gold-soft text-gold-2" : "text-muted hover:bg-surface-hover hover:text-gold-2"
      )}
    >
      {children}
    </button>
  );
}

export const AyahCard = memo(function AyahCard({
  verse,
  chapterId,
  chapterName,
}: {
  verse: Verse;
  chapterId: number;
  chapterName: string;
}) {
  const scale = useSettings((s) => s.arabicScale);
  const showEnglish = useSettings((s) => s.showEnglish);
  const isActive = usePlayer((s) => s.activeVerseKey === verse.verse_key);
  const isPlaying = usePlayer((s) => s.isPlaying && s.activeVerseKey === verse.verse_key);
  const bookmarked = useBookmarks((s) => Boolean(s.bookmarks[verse.verse_key]));
  const toggleBookmark = useBookmarks((s) => s.toggleBookmark);

  const [copied, setCopied] = useState(false);
  const [tafsirOpen, setTafsirOpen] = useState(false);

  const ms = verse.translations?.find((t) => t.resource_id === TRANSLATION_MS)?.text ?? "";
  const en = verse.translations?.find((t) => t.resource_id === TRANSLATION_EN)?.text ?? "";

  const onPlay = () => {
    if (isActive) {
      requestControl("toggle");
    } else {
      requestPlay({ chapterId, chapterName, verseKey: verse.verse_key, mode: "continuous" });
    }
  };

  const onCopy = async () => {
    const text = `${verse.text_uthmani}\n\n${stripFootnotes(ms)}\n\n(Al-Quran ${verse.verse_key} — ${chapterName})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.article
      id={`ayah-${verse.verse_key}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      data-verse={verse.verse_key}
      className={cn(
        "glass-card scroll-mt-24 rounded-3xl p-5 transition sm:p-7",
        isActive && "ayah-active"
      )}
    >
      {/* Meta + actions */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <StarNumber value={verse.verse_number} size={40} className="text-gold-2" />
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold text-gold-2">{verse.verse_key}</span>
            <span className="text-[11px] text-muted">
              Muka Surat {verse.page_number} · Juzuk {verse.juz_number}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <ActionButton label={isPlaying ? "Jeda" : "Main ayat"} onClick={onPlay} active={isActive}>
            {isPlaying ? <IconPause size={17} /> : <IconPlay size={17} />}
          </ActionButton>
          <ActionButton
            label={bookmarked ? "Buang penanda" : "Tanda ayat"}
            onClick={() => toggleBookmark(verse.verse_key)}
            active={bookmarked}
          >
            <IconBookmark size={17} filled={bookmarked} />
          </ActionButton>
          <ActionButton label="Salin ayat" onClick={onCopy} active={copied}>
            {copied ? <IconCheck size={17} /> : <IconCopy size={17} />}
          </ActionButton>
          <ActionButton label="Tafsir" onClick={() => setTafsirOpen(true)}>
            <IconBookOpen size={17} />
          </ActionButton>
        </div>
      </div>

      {/* Arabic (glyph mushaf) */}
      <QuranWords
        words={verse.words}
        verseNumber={verse.verse_number}
        scale={scale}
        className="mb-5"
      />

      {/* Terjemahan */}
      {ms && (
        <p className="text-[0.98rem] leading-relaxed text-fg">
          <span
            dangerouslySetInnerHTML={{ __html: ms }}
            className="[&_sup]:ml-0.5 [&_sup]:align-super [&_sup]:text-[0.7em] [&_sup]:text-gold-2"
          />
        </p>
      )}
      {showEnglish && en && (
        <p className="mt-3 border-t border-border-base pt-3 text-[0.92rem] leading-relaxed text-muted">
          <span dangerouslySetInnerHTML={{ __html: en }} />
        </p>
      )}

      <TafsirSheet
        open={tafsirOpen}
        onClose={() => setTafsirOpen(false)}
        verseKey={verse.verse_key}
        chapterName={chapterName}
        verseNumber={verse.verse_number}
      />
    </motion.article>
  );
});
