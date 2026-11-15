"use client";

import { useEffect, useState } from "react";
import { readConsent, setConsent } from "@/lib/consent";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLang } from "@/components/theme/LanguageProvider";
import { useT } from "@/components/locale/translate";
import { LANG_COOKIE } from "@/lib/i18n";

export default function CookieBanner() {
  const t = useT();
  const { mode } = useTheme();
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  function accept() {
    setConsent("accepted");
    try {
      localStorage.setItem("wolfmain-theme", mode);
      document.cookie = `wolfmain-theme=${encodeURIComponent(mode)}; path=/; max-age=31536000; samesite=lax`;
      localStorage.setItem(LANG_COOKIE, lang);
      document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
    setVisible(false);
  }

  function reject() {
    setConsent("rejected");
    try {
      localStorage.setItem("wolfmain-theme", mode);
      document.cookie = `wolfmain-theme=${encodeURIComponent(mode)}; path=/; max-age=31536000; samesite=lax`;
      localStorage.setItem(LANG_COOKIE, lang);
      document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="card p-4 sm:p-5 border border-[var(--card-border)] shadow-[var(--shadow)] bg-[color:color-mix(in_srgb,var(--card-strong)_96%,transparent)] backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="icon-wrap w-10 h-10 rounded-xl shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 3a9 9 0 1 0 9 9c0-.5-.4-.9-.9-.9h-1.3a2.3 2.3 0 0 1 0-4.6h.5A9 9 0 0 0 12 3Z" />
                  <circle cx="8.5" cy="9" r="1" fill="currentColor" stroke="none" />
                  <circle cx="7.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
                  <circle cx="11.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] mb-1">{t("cookie.title")}</p>
                <p className="text-sm muted leading-relaxed">{t("cookie.description")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:self-center">
              <button type="button" onClick={reject} className="btn btn-ghost !py-2.5 !px-4">
                {t("cookie.reject")}
              </button>
              <button type="button" onClick={accept} className="btn btn-primary !py-2.5 !px-4">
                {t("cookie.accept")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}