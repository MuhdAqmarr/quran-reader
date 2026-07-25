"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { IconMoon, IconSun } from "./icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Tukar ke mod cerah" : "Tukar ke mod gelap"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="glass-card grid h-10 w-10 place-items-center rounded-full text-fg transition hover:text-gold-2 hover:ring-gold-glow"
    >
      {mounted ? (
        <motion.span
          key={resolvedTheme}
          initial={{ rotate: -40, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {isDark ? <IconMoon size={18} /> : <IconSun size={18} />}
        </motion.span>
      ) : (
        <span className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
