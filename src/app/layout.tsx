import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import AuthNavbar from "@/components/navbar/AuthNavbar";
import SiteFooter from "@/components/layout/SiteFooter";
import CookieBanner from "@/components/layout/CookieBanner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LangProvider } from "@/components/theme/LanguageProvider";
import { DEFAULT_LANG } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wolfmain",
  description: "Web code playground with editor, live preview and projects.",
};

const themeScript = `
(function() {
  try {
    function readCookie(name) {
      var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    }
    var mode = readCookie('wolfmain-theme') || localStorage.getItem('wolfmain-theme') || 'system';
    var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    var lang = readCookie('wolfmain-lang') || localStorage.getItem('wolfmain-lang') || 'en';
    if (lang !== 'en' && lang !== 'es') lang = 'en';
    document.documentElement.lang = lang;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={DEFAULT_LANG} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}
      >
        <LangProvider>
          <ThemeProvider>
            <header className="sticky top-0 z-30 relative border-b border-[color:color-mix(in_srgb,var(--accent-dusk)_26%,var(--card-border))] bg-[color:color-mix(in_srgb,var(--card-strong)_84%,transparent)] backdrop-blur-xl shadow-[0_12px_36px_-22px_rgba(31,58,72,0.32)] dark:shadow-[0_12px_36px_-22px_rgba(0,0,0,0.5)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--accent-dusk)_45%,transparent)] to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--accent)_28%,transparent)] to-transparent" />
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-lg tracking-tight"
                >
                  <Image
                    src="/img/wolfmain-logo.png"
                    alt="Wolfmain"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-xl"
                    priority
                  />
                  <span className="bg-gradient-to-r from-[#2f3e46] via-[#4f6658] to-[#6d8496] dark:from-[#dfe7e3] dark:via-[#b7c7bc] dark:to-[#89a0b3] bg-clip-text text-transparent">
                    Wolfmain
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <AuthNavbar />
                </div>
              </div>
            </header>
            <div className="flex-1 flex flex-col">{children}</div>
            <SiteFooter />
            <CookieBanner />
          </ThemeProvider>
        </LangProvider>
      </body>
    </html>
  );
}