export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function revelationPlaceMs(place: "makkah" | "madinah"): string {
  return place === "makkah" ? "Makkiyyah" : "Madaniyyah";
}

/** "2:255" → { chapter: 2, verse: 255 } */
export function parseVerseKey(key: string): { chapter: number; verse: number } {
  const [chapter, verse] = key.split(":").map(Number);
  return { chapter, verse };
}

/** Buang tag <sup> nota kaki dari teks terjemahan API. */
export function stripFootnotes(text: string): string {
  return text.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/\s{2,}/g, " ").trim();
}
