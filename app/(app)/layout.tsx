import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { AudioPlayer } from "@/components/audio-player";
import { getChapters } from "@/lib/quran-api";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { chapters } = await getChapters();

  return (
    <AppShell chapters={chapters}>
      {children}
      <AudioPlayer chapters={chapters} />
    </AppShell>
  );
}
