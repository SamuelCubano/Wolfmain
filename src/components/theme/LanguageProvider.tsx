"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  normalizeLang,
  type Lang,
} from "@/lib/i18n";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

function readStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const stored = localStorage.getItem(LANG_COOKIE);
  const fromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LANG_COOKIE}=`))
    ?.split("=")[1];
  return normalizeLang(stored ?? fromCookie ?? DEFAULT_LANG);
}

function applyLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = readStoredLang();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangState(stored);
    applyLang(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    const normalized = normalizeLang(next);
    setLangState(normalized);
    applyLang(normalized);
    localStorage.setItem(LANG_COOKIE, normalized);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}