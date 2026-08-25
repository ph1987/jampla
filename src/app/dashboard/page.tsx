import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";
import { ConnectYoutubeButton } from "@/components/ConnectYoutubeButton";
import { DisconnectYoutubeButton } from "@/components/DisconnectYoutubeButton";
import { NotificationBadge } from "@/components/NotificationBadge";
import { DashboardJamList } from "@/components/DashboardJamList";
import { getUserScore } from "@/lib/ranking";
import { getYoutubeChannelInfo } from "@/lib/youtube";

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
  const initialPendingCounts = Object.fromEntries(pendingCounts.map((p) => [p.jamId, p._count]));

  const youtubeAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
  });

  const points = await getUserScore(session.user.id);

  const channelInfo = youtubeAccount
    ? await getYoutubeChannelInfo(session.user.id)
    : null;

  return (
    <main className="page">
      <SiteHeader isLoggedIn />

      <div className="statline">
        <span>
          Olá, <b>{session.user.username ?? session.user.email}</b> ({points}){" "}
          <span className="sep">|</span> <NotificationBadge />
        </span>
        <LogoutButton />
      </div>

      <div className="panel">
        <p className="panel-title">Conta do YouTube</p>
        {youtubeAccount ? (
          <>
            {channelInfo ? (
              <>
                <div className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                  <img
                    src={channelInfo.thumbnailUrl}
                    alt={channelInfo.title}
                    width={48}
                    height={48}
                    style={{ border: "1px solid var(--border)", flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p className="hint-text" style={{ margin: 0 }}>{channelInfo.title}</p>
                    <div style={{ marginTop: 7 }}>
                      <DisconnectYoutubeButton accountId={youtubeAccount.id} showHint={false} />
                    </div>
                  </div>
                </div>
                <p className="hint-text">
                  Jams existentes param de aceitar aprovações até você reconectar.
                </p>
              </>
            ) : (
              <DisconnectYoutubeButton accountId={youtubeAccount.id} />
            )}
          </>
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
        <DashboardJamList jams={jams} initialPendingCounts={initialPendingCounts} />
        {youtubeAccount && (
          <p style={{ marginTop: 10 }}>
            <a href="/jams/new">[Criar Jam]</a>
          </p>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
