import { NextRequest, NextResponse } from "next/server";
import { getTafsir, TAFSIR_AR, TAFSIR_EN } from "@/lib/quran-api";

const ALLOWED_TAFSIRS = new Set([TAFSIR_EN, TAFSIR_AR]);
const VERSE_KEY_RE = /^\d{1,3}:\d{1,3}$/;

export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id") ?? String(TAFSIR_EN));
  const key = req.nextUrl.searchParams.get("key") ?? "";

  if (!ALLOWED_TAFSIRS.has(id)) {
    return NextResponse.json({ error: "Tafsir tidak sah" }, { status: 400 });
  }
  if (!VERSE_KEY_RE.test(key)) {
    return NextResponse.json({ error: "Kunci ayat tidak sah" }, { status: 400 });
  }

  try {
    const data = await getTafsir(id, key);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat tafsir" }, { status: 502 });
  }
}
