import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RegisterForm } from "@/components/RegisterForm";
import { LogoutButton } from "@/components/LogoutButton";
import { getUserScore } from "@/lib/ranking";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const points = session ? await getUserScore(session.user.id) : 0;

  return (
    <main className="page">
      <SiteHeader isLoggedIn={!!session} />

      {session ? (
        <div className="statline">
          Logado como{" "}
          <a href="/dashboard">
            <b>{session.user.username ?? session.user.email}</b>
          </a>{" "}
          ({points}){" "}
          <span className="sep">|</span> <LogoutButton />
        </div>
      ) : (
        <div className="panel">
          <p className="panel-title">Criar conta</p>
          <RegisterForm redirectTo={next || "/dashboard"} />
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
