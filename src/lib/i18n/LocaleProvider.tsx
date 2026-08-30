"use client";

import { createContext, useContext } from "react";
import { dictionaries, type Dictionary, type Locale } from "./dictionary";

type LocaleContextValue = { locale: Locale; dict: Dictionary };

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Only `locale` (a plain string) crosses the server/client boundary as a prop.
// The dictionary itself — which has functions for pluralized strings, and
// functions can't be passed from a Server Component to a Client Component —
// is looked up here, client-side, from the same static `dictionaries` map.
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dict = dictionaries[locale];
  return (
    <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>
  );
}

function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useDictionary/useLocale must be used within LocaleProvider");
  return ctx;
}

/** Client Components: get the full translated dictionary for the current locale. */
export function useDictionary(): Dictionary {
  return useLocaleContext().dict;
}

/** Client Components: get the current locale code (e.g. to pick from the switcher). */
export function useLocale(): Locale {
  return useLocaleContext().locale;
}
