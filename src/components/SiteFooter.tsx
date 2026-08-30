import { getDictionary } from "@/lib/i18n/server";

export async function SiteFooter() {
  const dict = await getDictionary();

  return (
    <div className="footer">
      <p className="credit">
        {dict.footer.developedBy}{" "}
        <a href="https://ph1987.github.io/" target="_blank" rel="noopener noreferrer">
          phldev
        </a>
        {" "}<span className="sep">|</span>{" "}
        <a href="/privacidade">{dict.footer.privacyPolicy}</a>
      </p>
    </div>
  );
}
