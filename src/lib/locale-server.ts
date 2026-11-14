import { cookies } from "next/headers";
import { LANG_COOKIE, normalizeLang, getTranslator, type Lang, type Translate } from "@/lib/i18n";

export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  return normalizeLang(store.get(LANG_COOKIE)?.value);
}

export async function getServerT(): Promise<Translate> {
  return getTranslator(await getServerLang());
}