import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { AudioPlayer } from "@/components/audio-player";
import { getChapters, getJuzs } from "@/lib/quran-api";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [{ chapters }, { juzs }] = await Promise.all([getChapters(), getJuzs()]);

  return (
    <AppShell chapters={chapters} juzs={juzs}>
      {children}
      <AudioPlayer chapters={chapters} />
    </AppShell>
  );
}
