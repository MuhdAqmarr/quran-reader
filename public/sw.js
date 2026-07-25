/* Quran Explorer — service worker (offline caching) */
const VERSION = "qe-v2";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const API_CACHE = `${VERSION}-api`;
const FONT_CACHE = `${VERSION}-fonts`;
const AUDIO_CACHE = `${VERSION}-audio`;

const PRECACHE = [
  "/",
  "/fonts/UthmanicHafs1Ver18.woff2",
  "/fonts/sura_names.woff2",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await Promise.allSettled(PRECACHE.map((u) => cache.add(u)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

const isFont = (url) =>
  url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/_next/static/media");
const isStatic = (url) =>
  url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons/");
const isAudio = (url) => /verses\.quran\.com|quranicaudio\.com|everyayah\.com/.test(url.host);

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  // Cari dalam cache sasaran, kemudian mana-mana cache (cth. item precache)
  const hit = (await cache.match(request)) || (await caches.match(request));
  if (hit) return hit;
  const res = await fetch(request);
  if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Navigasi halaman: network-first, fallback ke cache / shell
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(request);
          const cache = await caches.open(PAGE_CACHE);
          cache.put(request, net.clone());
          return net;
        } catch {
          return (
            (await caches.match(request)) ||
            (await caches.match("/")) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // Audio (silang-asal): cache-first (opaque dibenarkan)
  if (isAudio(url)) {
    event.respondWith(
      cacheFirst(request, AUDIO_CACHE).catch(() => caches.match(request))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Font + aset statik: cache-first (immutable)
  if (isFont(url) || isStatic(url)) {
    event.respondWith(cacheFirst(request, isFont(url) ? FONT_CACHE : STATIC_CACHE));
    return;
  }

  // API proksi: stale-while-revalidate (baca surah offline selepas lawatan pertama)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const hit = await cache.match(request);
        const net = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => null);
        return hit || (await net) || Response.error();
      })()
    );
    return;
  }

  // Selebihnya: network dengan fallback cache
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// Kemas kini serta-merta bila versi baru diaktifkan
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});
