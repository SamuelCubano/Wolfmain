"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { useT } from "@/components/locale/translate";

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <div className="icon-wrap w-12 h-12 mb-4 group-hover:scale-105 group-hover:shadow-[0_0_0_1px_rgba(155,176,161,0.18),0_14px_30px_-14px_rgba(27,36,43,0.45)] transition">
      {children}
    </div>
  );
}

const icons = {
  editor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7l-4 5 4 5" />
      <path d="M16 7l4 5-4 5" />
      <path d="M13 5l-2 14" />
    </svg>
  ),
  preview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3 5.5 14h6L10 21l8.5-11h-6z" />
    </svg>
  ),
  theme: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h2.2A3.8 3.8 0 0 0 18 8.2 5.2 5.2 0 0 0 12.8 3Z" />
      <circle cx="7.8" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.2" cy="7.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.2" cy="7.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 7.5a2 2 0 0 1 2-2h4.2l1.8 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M3.5 10.5h17" />
    </svg>
  ),
  account: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="10" rx="2.2" />
      <path d="M8 10V7.8a4 4 0 0 1 8 0V10" />
      <circle cx="12" cy="15" r="1.4" />
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19c4.5-1 7.5-4 9.5-8.5C16 7 18 5 21 4c-1 3-3 5-6.5 6.5C10 12.5 7 15.5 6 20" />
      <path d="M8.5 13.5c-1.2-1.2-2.5-1.8-4.5-2  .2 2 .8 3.3 2 4.5" />
    </svg>
  ),
};

export default function HomeClient() {
  const t = useT();

  const features = [
    { key: "editor", icon: icons.editor, title: t("home.feature.editor.title"), desc: t("home.feature.editor.desc") },
    { key: "preview", icon: icons.preview, title: t("home.feature.preview.title"), desc: t("home.feature.preview.desc") },
    { key: "theme", icon: icons.theme, title: t("home.feature.theme.title"), desc: t("home.feature.theme.desc") },
    { key: "projects", icon: icons.projects, title: t("home.feature.projects.title"), desc: t("home.feature.projects.desc") },
    { key: "account", icon: icons.account, title: t("home.feature.account.title"), desc: t("home.feature.account.desc") },
    { key: "scale", icon: icons.scale, title: t("home.feature.scale.title"), desc: t("home.feature.scale.desc") },
  ];

  return (
    <main className="flex-1 app-bg">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[980px] h-[520px] rounded-full bg-[rgba(125,143,161,0.18)] blur-3xl" />
          <div className="absolute top-10 right-[10%] w-[420px] h-[320px] rounded-full bg-[rgba(79,102,88,0.14)] blur-3xl" />
          <div className="absolute -bottom-20 left-[8%] w-[520px] h-[320px] rounded-full bg-[rgba(99,114,125,0.12)] blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/img/wolfmain-logo.png"
              alt="Wolfmain"
              width={88}
              height={88}
              className="h-20 w-20 sm:h-24 sm:w-24"
              priority
            />
          </div>
          <span className="pill-accent mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-dusk)] animate-pulse shadow-[0_0_14px_rgba(137,160,179,0.7)]" />
            {t("home.badge")}
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-[var(--foreground)] via-[#4f6658] to-[var(--foreground)] dark:from-[#dde5ea] dark:via-[#b7c7bc] dark:to-[#95a3ad] bg-clip-text text-transparent">
              {t("home.title.a")}
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#2f3e46] via-[#5f7568] to-[#7d8fa1] dark:from-[#b7c7bc] dark:via-[#89a0b3] dark:to-[#7d8fa1] bg-clip-text text-transparent">
              {t("home.title.b")}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("home.subtitle")}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register" className="btn btn-primary !px-6 !py-3 text-base">
              {t("home.cta.primary")}
            </Link>
            <Link href="/editor" className="btn btn-ghost !px-6 !py-3 text-base">
              {t("home.cta.editor")}
            </Link>
            <Link href="/dashboard" className="btn btn-ghost !px-6 !py-3 text-base">
              {t("home.cta.projects")}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f) => (
            <div
              key={f.key}
              className="group card p-6 hover:-translate-y-1 hover:border-[color:color-mix(in_srgb,var(--accent-dusk)_35%,var(--card-border))] transition duration-300"
            >
              <FeatureIcon>{f.icon}</FeatureIcon>
              <h3 className="text-base font-semibold mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}