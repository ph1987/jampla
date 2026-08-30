import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RegisterForm } from "@/components/RegisterForm";
import { LogoutButton } from "@/components/LogoutButton";
import { PointsBadge } from "@/components/PointsBadge";
import { getUserScore } from "@/lib/ranking";
import { getDictionary } from "@/lib/i18n/server";

export default async function RegisterPage({
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

      {session ? (
        <div className="statline">
          <span>
            {dict.common.greeting}{" "}
            <a href="/dashboard">
              <b>{session.user.username ?? session.user.email}</b>
            </a>
            <PointsBadge points={points} />
          </span>
          <LogoutButton />
        </div>
      ) : (
        <div className="panel">
          <p className="panel-title">{dict.nav.createAccount}</p>
          <RegisterForm redirectTo={next || "/dashboard"} />
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
