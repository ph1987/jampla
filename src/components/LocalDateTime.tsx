"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/dictionary";

// toLocaleString locale tags, not our own UI locale codes — controls date/time
// formatting conventions (day/month order, etc.), separate from translated text.
const INTL_LOCALE: Record<Locale, string> = {
  "pt-BR": "pt-BR",
  en: "en-US",
  es: "es-ES",
};

function format(iso: string, locale: Locale) {
  return new Date(iso)
    .toLocaleString(INTL_LOCALE[locale], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");
}

export function LocalDateTime({ iso }: { iso: string }) {
  const locale = useLocale();
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(format(iso, locale));
  }, [iso, locale]);

  return <>{text ?? ""}</>;
}
