import { NextRequest, NextResponse } from "next/server";
import { getVersesByChapter } from "@/lib/quran-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chapter: string }> }
) {
  const { chapter } = await params;
  const chapterNum = Number(chapter);
  if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > 114) {
    return NextResponse.json({ error: "Surah tidak sah" }, { status: 400 });
  }

  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  if (!Number.isInteger(page) || page < 1 || page > 300) {
    return NextResponse.json({ error: "Halaman tidak sah" }, { status: 400 });
  }

  try {
    const data = await getVersesByChapter(chapterNum, page);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat ayat" }, { status: 502 });
  }
}
