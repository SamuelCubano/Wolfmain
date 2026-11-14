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
      className={`inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-0.5 ${className}`}
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
            className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
              active
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {shortLabel[code]}
          </button>
        );
      })}
    </div>
  );
}