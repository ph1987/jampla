import { getDictionary } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";

const LOGO = `       █████                                     ████
      ░░███                                     ░░███
       ░███   ██████   █████████████   ████████  ░███   ██████
       ░███  ░░░░░███ ░░███░░███░░███ ░░███░░███ ░███  ░░░░░███
       ░███   ███████  ░███ ░███ ░███  ░███ ░███ ░███   ███████
 ███   ░███  ███░░███  ░███ ░███ ░███  ░███ ░███ ░███  ███░░███
░░████████  ░░████████ █████░███ █████ ░███████  █████░░████████
 ░░░░░░░░    ░░░░░░░░ ░░░░░ ░░░ ░░░░░  ░███░░░  ░░░░░  ░░░░░░░░
                                       ░███
                                       █████
                                      ░░░░░`;

export async function SiteHeader({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const dict = await getDictionary();

  return (
    <>
      <pre className="ascii-logo">{LOGO}</pre>
      <nav className="navbar">
        <span>
          <a href="/">{dict.nav.home}</a>
          <span className="sep">|</span>
          <a href="/#como-funciona">{dict.nav.howItWorks}</a>
          <span className="sep">|</span>
          <a href="/ranking">{dict.nav.ranking}</a>
          {!isLoggedIn && (
            <>
              <span className="sep">|</span>
              <a href="/register">{dict.nav.createAccount}</a>
            </>
          )}
        </span>
        <LanguageSwitcher />
      </nav>
    </>
  );
}
