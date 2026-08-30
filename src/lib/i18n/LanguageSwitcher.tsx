"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { LOCALE_COOKIE, type Locale } from "./dictionary";

const FLAGS: { locale: Locale; flag: string; label: string }[] = [
  { locale: "pt-BR", flag: "🇧🇷", label: "Português" },
  { locale: "en", flag: "🇺🇸", label: "English" },
  { locale: "es", flag: "🇪🇸", label: "Español" },
];

// Plain top-level function (not inside the component/hook body) so setting
// this global cookie isn't flagged as an impure render-time mutation.
function setLocaleCookie(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  function selectLocale(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    router.refresh();
  }

  return (
    <span className="lang-switcher">
      {FLAGS.map((f) => (
        <button
          key={f.locale}
          type="button"
          className={`lang-flag${f.locale === locale ? " active" : ""}`}
          title={f.label}
          aria-label={f.label}
          aria-pressed={f.locale === locale}
          onClick={() => selectLocale(f.locale)}
        >
          {f.flag}
        </button>
      ))}
    </span>
  );
}
