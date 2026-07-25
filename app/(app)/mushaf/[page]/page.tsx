import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVersesByPage } from "@/lib/quran-api";
import { MushafReader } from "@/components/mushaf-reader";

export const revalidate = 604800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Mod Baca — Muka Surat ${page}`,
    description: `Mushaf KFGQPC Madinah, muka surat ${page} daripada 604.`,
  };
}

export default async function MushafPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNum = Number(page);
  if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > 604) {
    notFound();
  }

  const data = await getVersesByPage(pageNum);

  return <MushafReader initialPage={pageNum} initialData={data} />;
}
