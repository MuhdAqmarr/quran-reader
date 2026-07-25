import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bintang 8 penjuru (khatam) dengan nombor di tengah — untuk nombor surah/ayat. */
export function StarNumber({
  value,
  className,
  size = 40,
}: {
  value: number | string;
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn("relative inline-flex items-center justify-center shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="1.1">
          <rect x="9.6" y="9.6" width="20.8" height="20.8" rx="2.5" />
          <rect
            x="9.6"
            y="9.6"
            width="20.8"
            height="20.8"
            rx="2.5"
            transform="rotate(45 20 20)"
          />
        </g>
      </svg>
      <span className="relative text-[0.72em] font-bold tabular-nums leading-none">
        {value}
      </span>
    </span>
  );
}

/** Divider ornamental — garis kembar + permata di tengah. */
export function OrnamentDivider({ className }: { className?: string }) {
  return (
    <div className={cn("ornament-divider", className)} aria-hidden>
      <svg width="46" height="12" viewBox="0 0 46 12" fill="none" className="shrink-0">
        <path
          d="M23 1 27.5 6 23 11 18.5 6 23 1Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <path d="M23 3.4 25.4 6 23 8.6 20.6 6 23 3.4Z" fill="currentColor" opacity="0.85" />
        <circle cx="8" cy="6" r="1.6" fill="currentColor" opacity="0.6" />
        <circle cx="38" cy="6" r="1.6" fill="currentColor" opacity="0.6" />
      </svg>
    </div>
  );
}

/** Sudut ornamen untuk frame header surah. */
function Corner({ className }: { className?: string }) {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      className={className}
      aria-hidden
    >
      <g stroke="currentColor" fill="none">
        <path d="M2 50V14C2 7.4 7.4 2 14 2h36" strokeWidth="1.4" />
        <path d="M7 50V16.5C7 11.3 11.3 7 16.5 7H50" strokeWidth="0.8" opacity="0.55" />
        <g strokeWidth="1">
          <rect x="10.8" y="10.8" width="12.4" height="12.4" rx="1.5" />
          <rect
            x="10.8"
            y="10.8"
            width="12.4"
            height="12.4"
            rx="1.5"
            transform="rotate(45 17 17)"
          />
        </g>
        <circle cx="17" cy="17" r="2.2" fill="currentColor" stroke="none" opacity="0.9" />
      </g>
    </svg>
  );
}

/** Frame berhias penuh untuk header surah — border kembar + 4 sudut khatam. */
export function SurahFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute inset-[10px] rounded-lg border opacity-60"
        style={{ borderColor: "var(--gold-border)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[15px] rounded-md border opacity-35"
        style={{ borderColor: "var(--gold-border)" }}
        aria-hidden
      />
      <span className="pointer-events-none absolute left-[3px] top-[3px] text-gold">
        <Corner />
      </span>
      <span className="pointer-events-none absolute right-[3px] top-[3px] text-gold">
        <Corner className="-scale-x-100" />
      </span>
      <span className="pointer-events-none absolute bottom-[3px] left-[3px] text-gold">
        <Corner className="-scale-y-100" />
      </span>
      <span className="pointer-events-none absolute bottom-[3px] right-[3px] text-gold">
        <Corner className="-scale-100" />
      </span>
      <div className="relative px-10 py-9 sm:px-14">{children}</div>
    </div>
  );
}

/** Nama surah dalam khat KFGQPC (font sura_names — ligature "001".."114"). */
export function SurahNameCalligraphy({
  id,
  className,
}: {
  id: number;
  className?: string;
}) {
  return (
    <span translate="no" aria-hidden className={cn("font-surah-names", className)}>
      {String(id).padStart(3, "0")}
    </span>
  );
}
