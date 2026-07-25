import "server-only";
import type {
  ChapterAudioResponse,
  ChapterResponse,
  ChaptersResponse,
  JuzsResponse,
  TafsirResponse,
  VersesResponse,
} from "./types";

/**
 * Lapisan data — SEMUA teks Quran/terjemahan/tafsir/timing datang dari
 * Quran.com API v4 (teks digital rasmi KFGQPC Madinah Mushaf).
 * Tiada teks Quran di-hardcode dalam codebase ini.
 */

const API = "https://api.quran.com/api/v4";
const QDC = "https://api.quran.com/api/qdc";

/** Teks Quran immutable — cache seminggu, serve stale sementara revalidate. */
const WEEK = 604_800;

export const TRANSLATION_MS = 39; // Abdullah Muhammad Basmeih (Melayu)
export const TRANSLATION_EN = 20; // Saheeh International
export const TAFSIR_EN = 169; // Ibn Kathir (Abridged, English)
export const TAFSIR_AR = 16; // Tafsir Muyassar (Arab)

const VERSE_FIELDS = "text_uthmani,page_number,juz_number";
const WORD_FIELDS = "code_v2,text_uthmani,page_number,line_number,char_type_name";

async function qget<T>(url: string, revalidate: number = WEEK): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Quran API ${res.status} — ${url}`);
  }
  return res.json() as Promise<T>;
}

export function getChapters(): Promise<ChaptersResponse> {
  return qget(`${API}/chapters?language=ms`);
}

export function getChapter(id: number): Promise<ChapterResponse> {
  return qget(`${API}/chapters/${id}?language=ms`);
}

export function getVersesByChapter(
  chapter: number,
  page = 1,
  perPage = 20
): Promise<VersesResponse> {
  const params = new URLSearchParams({
    language: "ms",
    words: "true",
    translations: `${TRANSLATION_MS},${TRANSLATION_EN}`,
    fields: VERSE_FIELDS,
    word_fields: WORD_FIELDS,
    per_page: String(perPage),
    page: String(page),
  });
  return qget(`${API}/verses/by_chapter/${chapter}?${params}`);
}

/** Semua ayat + words satu muka surat mushaf (1–604) untuk Mod Baca. */
export function getVersesByPage(page: number): Promise<VersesResponse> {
  const params = new URLSearchParams({
    words: "true",
    fields: VERSE_FIELDS,
    word_fields: WORD_FIELDS,
    per_page: "60",
  });
  return qget(`${API}/verses/by_page/${page}?${params}`);
}

export function getTafsir(tafsirId: number, verseKey: string): Promise<TafsirResponse> {
  return qget(`${API}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
}

/** Fail mp3 full-surah + verse_timings (ms) + word segments untuk satu qari. */
export function getChapterAudio(
  reciterId: number,
  chapter: number
): Promise<ChapterAudioResponse> {
  return qget(
    `${QDC}/audio/reciters/${reciterId}/audio_files?chapter=${chapter}&segments=true`
  );
}

export async function getJuzs(): Promise<JuzsResponse> {
  const data = await qget<JuzsResponse>(`${API}/juzs`);
  // Endpoint ni pulangkan rekod berganda — dedupe ikut juz_number
  const seen = new Set<number>();
  const juzs = data.juzs.filter((j) => {
    if (seen.has(j.juz_number)) return false;
    seen.add(j.juz_number);
    return true;
  });
  return { juzs };
}
