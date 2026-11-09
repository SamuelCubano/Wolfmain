import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AuthNavbar from "@/components/navbar/AuthNavbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev al instante",
  description: "Playground de código web con editor, vista previa y proyectos.",
};

const themeScript = `
(function() {
  try {
    var mode = localStorage.getItem('wolfmain-theme') || 'system';
    var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <header className="sticky top-0 z-30 border-b border-white/10 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-lg tracking-tight"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                  W
                </span>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                  Dev al instante
                </span>
              </Link>
              <AuthNavbar />
            </div>
          </header>
          <div className="flex-1 flex flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
