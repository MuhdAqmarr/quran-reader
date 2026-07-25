const MONTHS_MS = [
  "Muharram",
  "Safar",
  "Rabiulawal",
  "Rabiulakhir",
  "Jamadilawal",
  "Jamadilakhir",
  "Rejab",
  "Syaaban",
  "Ramadan",
  "Syawal",
  "Zulkaedah",
  "Zulhijjah",
];

/** Tarikh Hijri hari ini dalam BM, cth "15 Rejab 1447H". Panggil client-side sahaja. */
export function hijriToday(): string {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(new Date());

    const day = parts.find((p) => p.type === "day")?.value ?? "";
    const month = Number(parts.find((p) => p.type === "month")?.value ?? "1");
    const year = parts.find((p) => p.type === "year")?.value ?? "";
    return `${day} ${MONTHS_MS[month - 1] ?? ""} ${year}H`;
  } catch {
    return "";
  }
}
