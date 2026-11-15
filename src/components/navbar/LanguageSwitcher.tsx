"use client";

import { useLang } from "@/components/theme/LanguageProvider";
import { useT } from "@/components/locale/translate";
import { LANGS, type Lang } from "@/lib/i18n";

const shortLabel: Record<Lang, string> = { en: "EN", es: "ES" };

const fullLabel: Record<Lang, string> = { en: "English", es: "Español" };

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  const t = useT();

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card-strong)_70%,transparent)] p-1 gap-1 ${className}`}
      role="group"
      aria-label={t("lang.switch")}
      title={t("lang.switch")}
    >
      {LANGS.map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            lang={code}
            aria-pressed={active}
            title={fullLabel[code]}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
              active
                ? "bg-[color:color-mix(in_srgb,var(--card-strong)_96%,transparent)] text-[var(--accent-strong)] dark:text-[var(--accent-bright)] shadow-sm border border-[var(--card-border)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)] border border-transparent"
            }`}
          >
            {shortLabel[code]}
          </button>
        );
      })}
    </div>
  );
}