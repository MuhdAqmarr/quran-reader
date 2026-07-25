import Link from "next/link";
import { getChapters } from "@/lib/quran-api";
import { SurahGrid } from "@/components/surah-grid";
import { ResumeCard } from "@/components/resume-card";
import { OrnamentDivider } from "@/components/ornaments";
import { IconBookOpen } from "@/components/icons";

export default async function HomePage() {
  const { chapters } = await getChapters();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      {/* Hero */}
      <section className="relative mb-10 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-2">
          Al-Quran Al-Karim
        </p>
        <h1 className="font-uthmanic text-5xl leading-tight text-fg-strong sm:text-6xl" translate="no" dir="rtl">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-muted">
          Baca, dengar dan hayati Al-Quran — mushaf rasmi KFGQPC, terjemahan Bahasa
          Melayu, tafsir, dan bacaan audio daripada qari terkemuka.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/surah/1"
            className="glass-strong inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-fg-strong ring-gold-glow transition hover:-translate-y-0.5"
          >
            <IconBookOpen size={18} className="text-gold-2" />
            Mula Membaca
          </Link>
          <Link
            href="/mushaf/1"
            className="glass-card inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-fg transition hover:text-gold-2"
          >
            Mod Baca Mushaf
          </Link>
        </div>

        <div className="mx-auto mt-8 max-w-md">
          <ResumeCard />
        </div>
      </section>

      <OrnamentDivider className="mb-8" />

      <SurahGrid chapters={chapters} />

      <footer className="mt-14 border-t border-border-base pt-6 text-center text-xs text-muted">
        Teks &amp; terjemahan daripada Quran.com API (KFGQPC Madinah Mushaf ·
        Terjemahan Abdullah Muhammad Basmeih). Audio daripada Quran.com / EveryAyah.
      </footer>
    </div>
  );
}
