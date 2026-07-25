import { NextRequest, NextResponse } from "next/server";
import { getChapterAudio } from "@/lib/quran-api";
import { RECITER_IDS } from "@/lib/reciters";

export async function GET(req: NextRequest) {
  const reciter = Number(req.nextUrl.searchParams.get("reciter"));
  const chapter = Number(req.nextUrl.searchParams.get("chapter"));

  if (!RECITER_IDS.has(reciter)) {
    return NextResponse.json({ error: "Qari tidak sah" }, { status: 400 });
  }
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) {
    return NextResponse.json({ error: "Surah tidak sah" }, { status: 400 });
  }

  try {
    const data = await getChapterAudio(reciter, chapter);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat audio" }, { status: 502 });
  }
}
