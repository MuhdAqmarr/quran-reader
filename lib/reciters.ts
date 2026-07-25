/** 7 qari — id Quran.com API verified live (resources/recitations). */

export interface Reciter {
  id: number;
  name: string;
  style: string;
}

export const RECITERS: Reciter[] = [
  { id: 7, name: "Mishari Rashid al-Afasy", style: "Murattal" },
  { id: 3, name: "Abdur-Rahman as-Sudais", style: "Murattal" },
  { id: 2, name: "AbdulBaset AbdulSamad", style: "Murattal" },
  { id: 6, name: "Mahmoud Khalil Al-Husary", style: "Murattal" },
  { id: 9, name: "Mohamed Siddiq al-Minshawi", style: "Murattal" },
  { id: 10, name: "Sa'ud ash-Shuraym", style: "Murattal" },
  { id: 4, name: "Abu Bakr al-Shatri", style: "Murattal" },
];

export const DEFAULT_RECITER_ID = 7;

export const RECITER_IDS = new Set(RECITERS.map((r) => r.id));

export function getReciter(id: number): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}
