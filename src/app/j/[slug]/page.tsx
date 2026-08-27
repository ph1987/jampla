import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoginForm } from "@/components/LoginForm";
import { SubmitLinkForm } from "@/components/SubmitLinkForm";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBadge } from "@/components/NotificationBadge";
import { PointsBadge } from "@/components/PointsBadge";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { PendingSuggestionsPanel } from "@/components/PendingSuggestionsPanel";
import { PlaylistPanel } from "@/components/PlaylistPanel";
import { getUserScore } from "@/lib/ranking";
import { getSiteOrigin } from "@/lib/url";
import { getPlaylistItems } from "@/lib/youtube";
import { NO_MAX_LINKS, NO_MIN_INTERVAL } from "@/lib/jamLimits";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "pendente",
  APPROVED: "aprovado",
  REJECTED: "rejeitado",
};

export default async function JamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const jam = await prisma.jam.findUnique({ where: { slug } });
  if (!jam) notFound();

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main className="page">
        <SiteHeader />
        <div className="panel">
          <p className="panel-title">{jam.name}</p>
          <p className="hint-text">
            Entre ou crie uma conta para adicionar músicas a esta Jam.
          </p>
          <LoginForm redirectTo={`/j/${slug}`} />
        </div>
        <SiteFooter />
      </main>
    );
  }

  const isOwner = session.user.id === jam.ownerId;

  const ban = isOwner
    ? null
    : await prisma.jamBan.findUnique({
        where: { jamId_userId: { jamId: jam.id, userId: session.user.id } },
      });

  if (ban) {
    return (
      <main className="page">
        <SiteHeader isLoggedIn />
        <div className="panel">
          <p className="panel-title">{jam.name}</p>
          <p className="error-text">Você foi removido desta Jam.</p>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const points = await getUserScore(session.user.id);
  const { items: playlistItems, error: playlistError } = await getPlaylistItems(
    jam.ownerId,
    jam.youtubePlaylistId,
  );
  const playlistSidebar = (
    <div className="jam-sidebar">
      <PlaylistPanel items={playlistItems} error={playlistError} />
    </div>
  );

  const statline = (
    <div className="statline">
      <span>
        Olá,{" "}
        <a href="/dashboard">
          <b>{session.user.username ?? session.user.email}</b>
        </a>
        <PointsBadge points={points} />
        <span className="sep">|</span> <NotificationBadge />
      </span>
      <LogoutButton />
    </div>
  );

  if (isOwner) {
    const origin = await getSiteOrigin();

    const [pending, reviewed] = await Promise.all([
      prisma.suggestion.findMany({
        where: { jamId: jam.id, status: "PENDING" },
        orderBy: { createdAt: "asc" },
      }),
      prisma.suggestion.findMany({
        where: { jamId: jam.id, status: { not: "PENDING" } },
        orderBy: { reviewedAt: "desc" },
        take: 20,
      }),
    ]);

    const submitterIds = [...new Set([...pending, ...reviewed].map((s) => s.submittedBy))];
    const submitters = await prisma.user.findMany({
      where: { id: { in: submitterIds } },
      select: { id: true, username: true },
    });
    const submitterNames = Object.fromEntries(submitters.map((u) => [u.id, u.username]));

    return (
      <main className="page">
        <SiteHeader isLoggedIn />
        {statline}

        <div className="jam-layout">
          <div className="jam-main">
            <div className="panel">
              <p className="panel-title">{jam.name}</p>
              <p className="hint-text">
                Link para compartilhar:{" "}
                <a href={`/j/${jam.slug}`}>
                  {origin}/j/{jam.slug}
                </a>
                <CopyLinkButton path={`/j/${jam.slug}`} />
              </p>
              <p className="hint-text">
                Playlist no YouTube:{" "}
                <a
                  href={`https://www.youtube.com/playlist?list=${jam.youtubePlaylistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  abrir playlist
                </a>
              </p>
            </div>

            <PendingSuggestionsPanel
              slug={slug}
              initialData={{ pending, reviewed, submitterNames }}
            />
          </div>

          {playlistSidebar}
        </div>

        <SiteFooter />
      </main>
    );
  }

  const suggestions = await prisma.suggestion.findMany({
    where: { jamId: jam.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const submitterIds = [...new Set(suggestions.map((s) => s.submittedBy))];
  const submitters = await prisma.user.findMany({
    where: { id: { in: submitterIds } },
    select: { id: true, username: true },
  });
  const submitterNames = new Map(submitters.map((u) => [u.id, u.username]));

  return (
    <main className="page">
      <SiteHeader isLoggedIn />
      {statline}

      <div className="jam-layout">
        <div className="jam-main">
          <div className="panel">
            <p className="panel-title">{jam.name}</p>
            <ul className="bullet-list">
              <li>
                {jam.allowDuplicates ? "Links repetidos permitidos" : "Sem links repetidos"}
              </li>
              {jam.maxLinksPerUser < NO_MAX_LINKS && (
                <li>Máx. {jam.maxLinksPerUser} links por convidado</li>
              )}
              {jam.minSecondsBetween > NO_MIN_INTERVAL && (
                <li>Intervalo mínimo de {jam.minSecondsBetween}s entre envios</li>
              )}
              <li>
                {jam.requireApproval
                  ? "Aprovação manual antes de entrar na playlist"
                  : "Entra direto na playlist"}
              </li>
            </ul>
            <SubmitLinkForm slug={slug} />
          </div>

          <div className="panel">
            <p className="panel-title">Envios</p>
            {suggestions.length === 0 ? (
              <p className="hint-text">Nenhum link enviado ainda.</p>
            ) : (
              <ul className="bullet-list">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    {s.videoTitle} —{" "}
                    <span className="hint-text">
                      {submitterNames.get(s.submittedBy) ?? "?"} ·{" "}
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {playlistSidebar}
      </div>

      <SiteFooter />
    </main>
  );
}
