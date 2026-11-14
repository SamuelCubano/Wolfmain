"use client";

import { useMemo } from "react";
import { useLang } from "@/components/theme/LanguageProvider";
import { getTranslator, localeTag, type Translate } from "@/lib/i18n";

export function useT(): Translate {
  const { lang } = useLang();
  return useMemo(() => getTranslator(lang), [lang]);
}

export function useLocaleTag(): string {
  const { lang } = useLang();
  return localeTag(lang);
}

export function useLangValue() {
  const { lang, setLang } = useLang();
  return { lang, setLang };
}