/** Jenis data dari Quran.com API v4 (semua endpoint verified live). */

export interface TranslatedName {
  name: string;
  language_name: string;
}

export interface Chapter {
  id: number;
  revelation_place: "makkah" | "madinah";
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: TranslatedName;
}

/** Satu unit perkataan mushaf. char_type "end" = glyph nombor ayat berhias. */
export interface Word {
  id: number;
  position: number;
  char_type_name: "word" | "end";
  /** Glyph codepoint(s) untuk font QPC V2 muka surat berkenaan (U+FCxx dsb.) */
  code_v2: string;
  text_uthmani: string;
  page_number: number;
  line_number: number;
}

export interface TranslationText {
  resource_id: number;
  text: string;
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string; // "2:255"
  page_number: number;
  juz_number: number;
  text_uthmani: string;
  words: Word[];
  translations?: TranslationText[];
}

export interface Pagination {
  per_page: number;
  current_page: number;
  next_page: number | null;
  total_pages: number;
  total_records: number;
}

export interface VersesResponse {
  verses: Verse[];
  pagination: Pagination;
}

export interface ChaptersResponse {
  chapters: Chapter[];
}

export interface ChapterResponse {
  chapter: Chapter;
}

export interface TafsirResponse {
  tafsir: {
    resource_id: number;
    resource_name?: string;
    slug?: string;
    text: string; // HTML
    translated_name?: TranslatedName;
  };
}

/** Timing per ayat dalam fail mp3 full-surah. segments = [word_index, start_ms, end_ms] */
export interface VerseTiming {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  duration: number;
  segments: [number, number, number][];
}

export interface ChapterAudioFile {
  chapter_id: number;
  file_size: number;
  format: string;
  audio_url: string;
  verse_timings: VerseTiming[];
}

export interface ChapterAudioResponse {
  audio_files: ChapterAudioFile[];
}

export interface Juz {
  id: number;
  juz_number: number;
  /** { "2": "1-141" } — chapter id → julat ayat */
  verse_mapping: Record<string, string>;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface JuzsResponse {
  juzs: Juz[];
}
