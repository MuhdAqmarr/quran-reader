"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import type { TafsirResponse } from "@/lib/types";
import { TAFSIR_AR, TAFSIR_EN } from "@/lib/constants";
import { IconSpinner, IconX } from "./icons";
import { OrnamentDivider } from "./ornaments";

const SOURCES = [
  { id: TAFSIR_EN, label: "Ibn Kathir", lang: "English" },
  { id: TAFSIR_AR, label: "Muyassar", lang: "العربية" },
] as const;

async function fetchTafsir(sourceId: number, verseKey: string): Promise<string> {
  const r = await fetch(`/api/tafsir?id=${sourceId}&key=${verseKey}`);
  if (!r.ok) throw new Error("tafsir");
  const data = (await r.json()) as TafsirResponse;
  return DOMPurify.sanitize(data.tafsir.text ?? "");
}

export function TafsirSheet({
  open,
  onClose,
  verseKey,
  chapterName,
  verseNumber,
}: {
  open: boolean;
  onClose: () => void;
  verseKey: string;
  chapterName: string;
  verseNumber: number;
}) {
  const [sourceId, setSourceId] = useState<number>(TAFSIR_EN);

  const { data: html = "", isLoading: loading, isError: error } = useQuery({
    queryKey: ["tafsir", sourceId, verseKey],
    queryFn: () => fetchTafsir(sourceId, verseKey),
    enabled: open,
    staleTime: Infinity,
  });

  // Kunci scroll body bila sheet terbuka
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const activeSource = SOURCES.find((s) => s.id === sourceId) ?? SOURCES[0];
  const isArabic = sourceId === TAFSIR_AR;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="glass-strong fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="dialog"
            aria-label={`Tafsir ayat ${verseKey}`}
          >
            <header className="flex items-center justify-between border-b border-border-base px-5 py-4">
              <div>
                <h3 className="font-bold text-fg-strong">Tafsir</h3>
                <p className="text-xs text-muted">
                  {chapterName} · Ayat {verseNumber} ({verseKey})
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Tutup tafsir"
                className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:text-fg"
              >
                <IconX size={18} />
              </button>
            </header>

            {/* Pemilih sumber + label bahasa (jujur: tiada tafsir Melayu dalam API) */}
            <div className="flex items-center gap-2 px-5 py-3">
              {SOURCES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSourceId(s.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    s.id === sourceId
                      ? "bg-gold-soft text-gold-2 ring-gold-glow"
                      : "text-muted hover:bg-surface-hover"
                  }`}
                >
                  {s.label}
                  <span className="ml-1.5 text-[11px] opacity-70">{s.lang}</span>
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
              <div className="mb-4 rounded-xl bg-gold-soft/50 px-3.5 py-2.5 text-xs text-muted">
                Tafsir {activeSource.label} dalam {activeSource.lang}. Tafsir Bahasa
                Melayu belum tersedia dalam sumber data — kami paparkan tafsir muktabar
                yang ada.
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 py-16 text-muted">
                  <IconSpinner size={22} />
                  <span>Memuat tafsir…</span>
                </div>
              )}

              {error && !loading && (
                <p className="py-16 text-center text-sm text-muted">
                  Gagal memuat tafsir untuk ayat ini. Cuba lagi atau pilih sumber lain.
                </p>
              )}

              {!loading && !error && html && (
                <>
                  <div
                    dir={isArabic ? "rtl" : "ltr"}
                    lang={isArabic ? "ar" : "en"}
                    className={`tafsir-prose ${isArabic ? "font-uthmanic text-right text-[1.4rem] leading-loose" : ""}`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                  <OrnamentDivider className="mt-8" />
                  <p className="mt-4 text-center text-[11px] text-muted">
                    Sumber: {activeSource.label} · via Quran.com API
                  </p>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
