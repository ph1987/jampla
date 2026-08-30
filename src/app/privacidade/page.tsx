import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata() {
  const dict = await getDictionary();
  return { title: dict.privacy.pageTitle };
}

export default async function PrivacyPage() {
  const dict = await getDictionary();
  const t = dict.privacy;

  return (
    <main className="page">
      <SiteHeader />

      <div className="panel">
        <p className="panel-title">{t.title}</p>
        <p className="hint-text">{t.lastUpdated}</p>
        <p>
          {t.introPrefix}
          <a href="https://ph1987.github.io/" target="_blank" rel="noopener noreferrer">
            phldev
          </a>
          {t.introSuffix}
        </p>
      </div>

      <div className="panel">
        <p className="panel-title">{t.dataCollectedTitle}</p>
        <p>{t.dataCollectedIntro}</p>
        <ul className="bullet-list">
          {t.dataCollectedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <p className="panel-title">{t.googleDataTitle}</p>
        <p>
          {t.googleDataIntroPrefix}
          <code>https://www.googleapis.com/auth/youtube</code>
          {t.googleDataIntroSuffix}
        </p>
        <ul className="bullet-list">
          {t.googleDataItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          {t.googleDataExplainPrefix}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.googleDataExplainLinkText}
          </a>
          {t.googleDataExplainSuffix}
        </p>
        <p className="hint-text">
          {t.googleDataHintPrefix}
          <a href="/dashboard">{t.googleDataHintDashboardLink}</a>
          {t.googleDataHintMiddle}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
          >
            myaccount.google.com/permissions
          </a>
          {t.googleDataHintSuffix}
        </p>
      </div>

      <div className="panel">
        <p className="panel-title">{t.sharingTitle}</p>
        <p>{t.sharingIntro}</p>
        <ul className="bullet-list">
          {t.sharingItems.map((item) => (
            <li key={item.name}>
              <b>{item.name}</b> — {item.desc}
            </li>
          ))}
        </ul>
        <p>{t.sharingOutro}</p>
      </div>

      <div className="panel">
        <p className="panel-title">{t.cookiesTitle}</p>
        <p>{t.cookiesText}</p>
      </div>

      <div className="panel">
        <p className="panel-title">{t.retentionTitle}</p>
        <p>
          {t.retentionPrefix}
          <a href="mailto:onboarding@jampla.com">onboarding@jampla.com</a>
          {t.retentionSuffix}
        </p>
      </div>

      <div className="panel">
        <p className="panel-title">{t.rightsTitle}</p>
        <p>
          {t.rightsPrefix}
          <a href="mailto:onboarding@jampla.com">onboarding@jampla.com</a>
          {t.rightsSuffix}
        </p>
      </div>

      <div className="panel">
        <p className="panel-title">{t.securityTitle}</p>
        <p>{t.securityText}</p>
      </div>

      <div className="panel">
        <p className="panel-title">{t.changesTitle}</p>
        <p>{t.changesText}</p>
      </div>

      <div className="panel">
        <p className="panel-title">{t.contactTitle}</p>
        <p>
          {t.contactPrefix}
          <a href="mailto:onboarding@jampla.com">onboarding@jampla.com</a>
          {t.contactSuffix}
        </p>
      </div>

      <SiteFooter />
    </main>
  );
}
