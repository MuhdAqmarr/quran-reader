import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Pwa } from "@/components/pwa";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Quran Explorer — Baca, Dengar, Hayati",
    template: "%s · Quran Explorer",
  },
  description:
    "Al-Quran digital dengan mushaf rasmi KFGQPC, terjemahan Bahasa Melayu (Basmeih), tafsir, dan bacaan audio daripada qari terkemuka.",
  applicationName: "Quran Explorer",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Quran Explorer",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06080f" },
    { media: "(prefers-color-scheme: light)", color: "#faf6ec" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning className={`${jakarta.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <Providers>
          <div className="bg-mesh" aria-hidden />
          <div className="bg-pattern" aria-hidden />
          {children}
          <Pwa />
        </Providers>
      </body>
    </html>
  );
}
