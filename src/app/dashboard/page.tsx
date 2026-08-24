import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";
import { ConnectYoutubeButton } from "@/components/ConnectYoutubeButton";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/");
  }

  const jams = await prisma.jam.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const pendingCounts = await prisma.suggestion.groupBy({
    by: ["jamId"],
    where: { jamId: { in: jams.map((j) => j.id) }, status: "PENDING" },
    _count: true,
  });
  const pendingByJam = new Map(pendingCounts.map((p) => [p.jamId, p._count]));

  const youtubeAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
  });

  return (
    <main className="page">
      <SiteHeader isLoggedIn />

      <div className="statline">
        Logado como <b>{session.user.username ?? session.user.email}</b>{" "}
        <span className="sep">|</span> <LogoutButton />
      </div>

      <div className="panel">
        <p className="panel-title">Conta do YouTube</p>
        {youtubeAccount ? (
          <p className="hint-text">Conectada</p>
        ) : (
          <>
            <p className="hint-text">
              Conecte sua conta do YouTube para poder criar uma Jam a partir
              de uma playlist sua.
            </p>
            <ConnectYoutubeButton />
          </>
        )}
      </div>

      <div className="panel">
        <p className="panel-title">Minhas Jams</p>
        {jams.length === 0 ? (
          <p className="hint-text">Você ainda não criou nenhuma Jam.</p>
        ) : (
          <ul className="bullet-list">
            {jams.map((jam) => {
              const pendingCount = pendingByJam.get(jam.id) ?? 0;
              return (
                <li key={jam.id}>
                  <a href={`/jams/${jam.slug}`}>{jam.name}</a> —{" "}
                  <a href={`/j/${jam.slug}`} className="hint-text">
                    /j/{jam.slug}
                  </a>
                  {pendingCount > 0 && (
                    <>
                      {" "}
                      <span style={{ color: "var(--accent2)" }}>
                        ({pendingCount} pendente{pendingCount > 1 ? "s" : ""})
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {youtubeAccount && (
          <p style={{ marginTop: 10 }}>
            <a href="/jams/new">[Criar Jam]</a>
          </p>
        )}
      </div>

      <div className="footer">jampla &mdash; MVP</div>
    </main>
  );
}
