import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBadge } from "@/components/NotificationBadge";
import { PointsBadge } from "@/components/PointsBadge";

const TOP_N = 10;

export default async function RankingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const approved = await prisma.suggestion.findMany({
    where: { status: "APPROVED" },
    select: {
      submittedBy: true,
      jamId: true,
      jam: { select: { ownerId: true, name: true, slug: true } },
    },
  });

  const pointsByUser = new Map<string, number>();
  const approvedCountByUser = new Map<string, number>();
  const publicApprovalsByJam = new Map<string, { name: string; slug: string; count: number }>();

  for (const s of approved) {
    const owner = s.jam.ownerId;
    const submitter = s.submittedBy;

    pointsByUser.set(owner, (pointsByUser.get(owner) ?? 0) + 1);
    approvedCountByUser.set(submitter, (approvedCountByUser.get(submitter) ?? 0) + 1);

    if (submitter !== owner) {
      pointsByUser.set(submitter, (pointsByUser.get(submitter) ?? 0) + 3);

      const entry = publicApprovalsByJam.get(s.jamId) ?? {
        name: s.jam.name,
        slug: s.jam.slug,
        count: 0,
      };
      entry.count += 1;
      publicApprovalsByJam.set(s.jamId, entry);
    }
  }

  const userIds = [...new Set([...pointsByUser.keys(), ...approvedCountByUser.keys()])];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true },
  });
  const userNames = new Map(users.map((u) => [u.id, u.username ?? "?"]));

  const topByPoints = [...pointsByUser.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N);
  const topByApproved = [...approvedCountByUser.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N);
  const topJams = [...publicApprovalsByJam.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, TOP_N);

  return (
    <main className="page">
      <SiteHeader isLoggedIn={!!session} />

      {session && (
        <div className="statline">
          <span>
            Olá,{" "}
            <a href="/dashboard">
              <b>{session.user.username ?? session.user.email}</b>
            </a>
            <PointsBadge points={pointsByUser.get(session.user.id) ?? 0} />
            <span className="sep">|</span> <NotificationBadge />
          </span>
          <LogoutButton />
        </div>
      )}

      <div className="ranking-grid">
        <div className="panel">
          <p className="panel-title">Como ganhar pontos</p>
          {session && (
            <p>Sua pontuação é: <b>{pointsByUser.get(session.user.id) ?? 0}</b></p>
          )}
          <p className="hint-text" style={{ margin: "4px 0" }}>
            1 ponto por aprovação
          </p>
          <p className="hint-text" style={{ margin: "4px 0" }}>
            3 pontos por aprovação
          </p>
        </div>

        <div className="panel">
          <p className="panel-title">Ranking por pontos</p>
          {topByPoints.length === 0 ? (
            <p className="hint-text">Ninguém pontuou ainda.</p>
          ) : (
            <ul className="bullet-list no-bullet">
              {topByPoints.map(([userId, points], i) => (
                <li key={userId}>
                  {i + 1}. {userNames.get(userId) ?? "?"} —{" "}
                  <span className="hint-text">
                    {points} ponto{points > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <p className="panel-title">Ranking por aprovações (envios)</p>
          {topByApproved.length === 0 ? (
            <p className="hint-text">Nenhuma música aprovada ainda.</p>
          ) : (
            <ul className="bullet-list no-bullet">
              {topByApproved.map(([userId, count], i) => (
                <li key={userId}>
                  {i + 1}. {userNames.get(userId) ?? "?"} —{" "}
                  <span className="hint-text">
                    {count} aprovaç{count > 1 ? "ões" : "ão"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <p className="panel-title">Playlists com mais aprovações do público</p>
          {topJams.length === 0 ? (
            <p className="hint-text">Nenhuma Jam com aprovações do público ainda.</p>
          ) : (
            <ul className="bullet-list no-bullet">
              {topJams.map(([jamId, entry], i) => (
                <li key={jamId}>
                  {i + 1}. <a href={`/j/${entry.slug}`}>{entry.name}</a> —{" "}
                  <span className="hint-text">
                    {entry.count} aprovaç{entry.count > 1 ? "ões" : "ão"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
