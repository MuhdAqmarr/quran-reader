import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getChapter, getVersesByChapter } from "@/lib/quran-api";
import { SurahHeader } from "@/components/surah-header";
import { VerseList } from "@/components/verse-list";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

export const revalidate = 604800;

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const { chapter } = await getChapter(Number(id));
    return {
      title: `${chapter.name_simple} — ${chapter.translated_name.name}`,
      description: `Baca Surah ${chapter.name_simple} (${chapter.translated_name.name}) — ${chapter.verses_count} ayat, terjemahan Bahasa Melayu, tafsir, dan audio.`,
    };
  } catch {
    return { title: "Surah" };
  }
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapterId = Number(id);
  if (!Number.isInteger(chapterId) || chapterId < 1 || chapterId > 114) {
    notFound();
  }

  const [{ chapter }, verses] = await Promise.all([
    getChapter(chapterId),
    getVersesByChapter(chapterId, 1),
  ]);

  const prev = chapterId > 1 ? chapterId - 1 : null;
  const next = chapterId < 114 ? chapterId + 1 : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-32 sm:px-6">
      <SurahHeader chapter={chapter} />

      <VerseList
        chapterId={chapterId}
        chapterName={chapter.name_simple}
        initialData={verses}
      />

      {/* Navigasi surah */}
      {/* RTL: arah baca kanan→kiri — "seterusnya" di kiri, "sebelum" di kanan. */}
      <nav className="mt-10 flex items-center justify-between gap-3">
        {next ? (
          <Link
            href={`/surah/${next}`}
            className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-fg transition hover:text-gold-2"
          >
            <IconChevronLeft size={17} />
            Surah seterusnya
          </Link>
        ) : (
          <span />
        )}
        {prev ? (
          <Link
            href={`/surah/${prev}`}
            className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-fg transition hover:text-gold-2"
          >
            Surah sebelum
            <IconChevronRight size={17} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
