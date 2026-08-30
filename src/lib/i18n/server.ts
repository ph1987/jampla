import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  dictionaries,
  LOCALE_COOKIE,
  LOCALES,
  type Dictionary,
  type Locale,
} from "./dictionary";

export { LOCALE_COOKIE };

function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Server-only: reads the visitor's chosen locale from the `locale` cookie. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Server-only: resolves the full dictionary for the visitor's current locale. */
export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale];
}
