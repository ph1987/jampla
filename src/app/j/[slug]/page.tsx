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
import { getDictionary } from "@/lib/i18n/server";

export default async function JamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const jam = await prisma.jam.findUnique({ where: { slug } });
  if (!jam) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const dict = await getDictionary();

  if (!session) {
    return (
      <main className="page">
        <SiteHeader />
        <div className="panel">
          <p className="panel-title">{jam.name}</p>
          <p className="hint-text">{dict.jamPage.loginPrompt}</p>
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
          <p className="error-text">{dict.jamPage.bannedMessage}</p>
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
        {dict.common.greeting}{" "}
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
                {dict.jamPage.shareLinkLabel}{" "}
                <a href={`/j/${jam.slug}`}>
                  {origin}/j/{jam.slug}
                </a>
                <CopyLinkButton path={`/j/${jam.slug}`} />
              </p>
              <p className="hint-text">
                {dict.jamPage.youtubePlaylistLabel}{" "}
                <a
                  href={`https://www.youtube.com/playlist?list=${jam.youtubePlaylistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dict.jamPage.openPlaylist}
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
                {jam.allowDuplicates ? dict.jamPage.allowDuplicatesOn : dict.jamPage.allowDuplicatesOff}
              </li>
              {jam.maxLinksPerUser < NO_MAX_LINKS && (
                <li>{dict.jamPage.maxLinksLine(jam.maxLinksPerUser)}</li>
              )}
              {jam.minSecondsBetween > NO_MIN_INTERVAL && (
                <li>{dict.jamPage.minIntervalLine(jam.minSecondsBetween)}</li>
              )}
              <li>
                {jam.requireApproval ? dict.jamPage.requireApprovalOn : dict.jamPage.requireApprovalOff}
              </li>
            </ul>
            <SubmitLinkForm slug={slug} />
          </div>

          <div className="panel">
            <p className="panel-title">{dict.jamPage.submissionsTitle}</p>
            {suggestions.length === 0 ? (
              <p className="hint-text">{dict.jamPage.noSubmissions}</p>
            ) : (
              <ul className="bullet-list">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    {s.videoTitle} —{" "}
                    <span className="hint-text">
                      {submitterNames.get(s.submittedBy) ?? "?"} ·{" "}
                      {dict.jamPage.statusLabels[s.status] ?? s.status}
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
