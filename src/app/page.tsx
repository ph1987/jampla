import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoginForm } from "@/components/LoginForm";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBadge } from "@/components/NotificationBadge";
import { PointsBadge } from "@/components/PointsBadge";
import { getUserScore } from "@/lib/ranking";
import { getDictionary } from "@/lib/i18n/server";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const points = session ? await getUserScore(session.user.id) : 0;
  const dict = await getDictionary();

  return (
    <main className="page">
      <SiteHeader isLoggedIn={!!session} />

      <div className="statline">
        <span>
          {dict.home.taglinePrefix}
          <b>{dict.home.taglineMvp}</b>
          {dict.home.taglineSuffix}
        </span>
      </div>

      {session ? (
        <div className="statline">
          <span>
            {dict.common.greeting}{" "}
            <a href="/dashboard">
              <b>{session.user.username ?? session.user.email}</b>
            </a>{" "}
            <PointsBadge points={points} />
            <span className="sep">|</span> <NotificationBadge />
          </span>
          <LogoutButton />
        </div>
      ) : (
        <div className="panel">
          <p className="panel-title">{dict.home.loginPanelTitle}</p>
          <LoginForm redirectTo={next || "/dashboard"} />
        </div>
      )}

      <div className="two-col">
        <div className="panel">
          <p className="panel-title">{dict.home.howItWorksTitle}</p>
          <ul className="bullet-list">
            {dict.home.howItWorksSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="panel" id="como-funciona">
          <p className="panel-title">{dict.home.rulesTitle}</p>
          <ul className="bullet-list">
            <li>{dict.home.allowDuplicatesRule}</li>
            <li>{dict.home.approvalRule}</li>
            <li>
              {dict.home.maxLinksRule}{" "}
              <span className="coming-soon">{dict.home.comingSoon}</span>
            </li>
            <li>
              {dict.home.minIntervalRule}{" "}
              <span className="coming-soon">{dict.home.comingSoon}</span>
            </li>
            <li>
              {dict.home.publicPlaylistRule}{" "}
              <span className="coming-soon">{dict.home.comingSoon}</span>
            </li>
          </ul>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
