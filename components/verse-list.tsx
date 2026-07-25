"use client";

import { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { VersesResponse } from "@/lib/types";
import { useBookmarks } from "@/lib/stores/bookmarks";
import { AyahCard } from "./ayah-card";
import { IconSpinner } from "./icons";

async function fetchVerses(chapterId: number, page: number): Promise<VersesResponse> {
  const res = await fetch(`/api/verses/${chapterId}?page=${page}`);
  if (!res.ok) throw new Error("verses");
  return res.json();
}

export function VerseList({
  chapterId,
  chapterName,
  initialData,
}: {
  chapterId: number;
  chapterName: string;
  initialData: VersesResponse;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const setLastRead = useBookmarks((s) => s.setLastRead);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["verses", chapterId],
    queryFn: ({ pageParam }) => fetchVerses(chapterId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.pagination.next_page ?? undefined,
    initialData: { pages: [initialData], pageParams: [1] },
    staleTime: Infinity,
  });

  const verses = data.pages.flatMap((p) => p.verses);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Jejak "sambung bacaan" — ayat teratas dalam pandangan
  const lastKeyRef = useRef<string | null>(null);
  const trackObserver = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const top = visible[0]?.target as HTMLElement | undefined;
          const key = top?.dataset.verse;
          if (key && key !== lastKeyRef.current) {
            lastKeyRef.current = key;
            setLastRead({
              chapterId,
              chapterName,
              verseKey: key,
              ts: Date.now(),
            });
          }
        },
        { rootMargin: "-45% 0px -45% 0px" }
      );
      node.querySelectorAll<HTMLElement>("[data-verse]").forEach((n) => io.observe(n));
      return () => io.disconnect();
    },
    [chapterId, chapterName, setLastRead]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return trackObserver(containerRef.current);
  }, [trackObserver, verses.length]);

  return (
    <div>
      <div ref={containerRef} className="space-y-4">
        {verses.map((verse) => (
          <AyahCard
            key={verse.verse_key}
            verse={verse}
            chapterId={chapterId}
            chapterName={chapterName}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-10" />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-6 text-muted">
          <IconSpinner size={20} />
          <span className="text-sm">Memuat ayat…</span>
        </div>
      )}
    </div>
  );
}
