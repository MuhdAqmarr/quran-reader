import { NextResponse } from "next/server";
import { getVersesByPage } from "@/lib/quran-api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;
  const pageNum = Number(page);
  if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > 604) {
    return NextResponse.json({ error: "Muka surat tidak sah" }, { status: 400 });
  }

  try {
    const data = await getVersesByPage(pageNum);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "Gagal memuat muka surat" }, { status: 502 });
  }
}
