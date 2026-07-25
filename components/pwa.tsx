"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMounted } from "@/lib/use-mounted";
import { IconX, IconBookOpen } from "./icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "qe-pwa-dismissed";

export function Pwa() {
  // Daftar service worker (kesan sampingan sahaja — bukan setState)
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () =>
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return <InstallBanner />;
}

function detectEnv() {
  if (typeof window === "undefined") {
    return { standalone: true, isIOS: false, wasDismissed: true };
  }
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari legacy flag
    window.navigator.standalone === true;
  const isIOS = /ipad|iphone|ipod/.test(window.navigator.userAgent.toLowerCase());
  let wasDismissed = false;
  try {
    wasDismissed = Boolean(localStorage.getItem(DISMISS_KEY));
  } catch {
    /* ignore */
  }
  return { standalone, isIOS, wasDismissed };
}

function InstallBanner() {
  const mounted = useMounted();
  const env = useMemo(() => detectEnv(), []);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (env.standalone || env.wasDismissed || env.isIOS) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent); // setState dalam callback — dibenarkan
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [env]);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  const show =
    mounted &&
    !env.standalone &&
    !env.wasDismissed &&
    !dismissed &&
    (env.isIOS || Boolean(deferred));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:left-auto sm:right-5 sm:max-w-sm sm:px-0"
        >
          <div className="glass-strong flex items-center gap-3 rounded-2xl p-3.5 ring-gold-glow">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold-2">
              <IconBookOpen size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-fg-strong">Pasang Quran Explorer</p>
              <p className="text-xs text-muted">
                {env.isIOS ? (
                  <>Tekan Kongsi ⎋ → &quot;Add to Home Screen&quot; untuk baca offline.</>
                ) : (
                  <>Baca offline, laju, macam app di skrin utama.</>
                )}
              </p>
            </div>
            {!env.isIOS && (
              <button
                onClick={install}
                className="shrink-0 rounded-full bg-gold-soft px-4 py-2 text-sm font-semibold text-gold-2 ring-gold-glow transition hover:scale-105"
              >
                Pasang
              </button>
            )}
            <button
              onClick={dismiss}
              aria-label="Tutup"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:text-fg"
            >
              <IconX size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
