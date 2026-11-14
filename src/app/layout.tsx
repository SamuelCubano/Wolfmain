import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import AuthNavbar from "@/components/navbar/AuthNavbar";
import LanguageSwitcher from "@/components/navbar/LanguageSwitcher";
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
    var mode = localStorage.getItem('wolfmain-theme') || 'system';
    var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    var lang = localStorage.getItem('wolfmain-lang');
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
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}>
        <LangProvider>
          <ThemeProvider>
            <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-lg tracking-tight"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                    W
                  </span>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                    Wolfmain
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <AuthNavbar />
                </div>
              </div>
            </header>
            <div className="flex-1 flex flex-col">{children}</div>
          </ThemeProvider>
        </LangProvider>
      </body>
    </html>
  );
}