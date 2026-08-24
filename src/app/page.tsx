import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoginForm } from "@/components/LoginForm";
import { LogoutButton } from "@/components/LogoutButton";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main className="page">
      <SiteHeader isLoggedIn={!!session} />

      <div className="statline">
        jampla: playlists colaborativas do YouTube · <b>MVP</b> em construção
      </div>

      {session ? (
        <div className="statline">
          Logado como{" "}
          <a href="/dashboard">
            <b>{session.user.username ?? session.user.email}</b>
          </a>{" "}
          <span className="sep">|</span> <LogoutButton />
        </div>
      ) : (
        <div className="panel">
          <p className="panel-title">Login</p>
          <LoginForm redirectTo={next || "/dashboard"} />
        </div>
      )}

      <div className="two-col">
        <div className="panel">
          <p className="panel-title">Como funciona</p>
          <ul className="bullet-list">
            <li>Crie sua conta e conecte sua conta do YouTube</li>
            <li>Inicie uma Jam a partir de uma playlist sua</li>
            <li>Compartilhe o link da Jam com quem quiser</li>
            <li>Convidados colam links de vídeos do YouTube</li>
            <li>Você configura limites, duplicados e aprovação</li>
          </ul>
        </div>

        <div className="panel" id="como-funciona">
          <p className="panel-title">Regras configuráveis por Jam</p>
          <ul className="bullet-list">
            <li>Permitir ou não links repetidos</li>
            <li>Máximo de links por convidado</li>
            <li>Intervalo mínimo entre envios (anti-flood)</li>
            <li>Aprovação manual ligada ou desligada</li>
          </ul>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
