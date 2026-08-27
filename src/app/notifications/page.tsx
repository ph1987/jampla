import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LogoutButton } from "@/components/LogoutButton";
import { getUserScore } from "@/lib/ranking";
import { LocalDateTime } from "@/components/LocalDateTime";
import { buildNotificationSegments } from "@/lib/notificationView";
import { PointsBadge } from "@/components/PointsBadge";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const jamIds = [...new Set(notifications.map((n) => n.jamId).filter((id): id is string => !!id))];
  const jams = await prisma.jam.findMany({
    where: { id: { in: jamIds } },
    select: { id: true, slug: true, name: true },
  });
  const jamsById = new Map(jams.map((j) => [j.id, j]));

  const suggestionIds = [
    ...new Set(notifications.map((n) => n.suggestionId).filter((id): id is string => !!id)),
  ];
  const suggestions = await prisma.suggestion.findMany({
    where: { id: { in: suggestionIds } },
    select: { id: true, videoId: true, videoTitle: true },
  });
  const suggestionsById = new Map(suggestions.map((s) => [s.id, s]));

  // Marca como lidas ao abrir a página, sem esconder nada da listagem —
  // usamos os `read` já carregados acima para ainda destacar as recém-lidas nesta visita.
  const hasUnread = notifications.some((n) => !n.read);
  if (hasUnread) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
  }

  const points = await getUserScore(session.user.id);

  return (
    <main className="page">
      <SiteHeader isLoggedIn />

      <div className="statline">
        <span>
          Olá,{" "}
          <a href="/dashboard">
            <b>{session.user.username ?? session.user.email}</b>
          </a>
          <PointsBadge points={points} />
        </span>
        <LogoutButton />
      </div>

      <div className="panel">
        <p className="panel-title">Notificações</p>
        {notifications.length === 0 ? (
          <p className="hint-text">Nenhuma notificação ainda.</p>
        ) : (
          <ul className="bullet-list">
            {notifications.map((n) => {
              const jam = n.jamId ? jamsById.get(n.jamId) : undefined;
              const jamHref = jam ? `/j/${jam.slug}` : undefined;
              const suggestion = n.suggestionId ? suggestionsById.get(n.suggestionId) : undefined;
              const videoHref = suggestion
                ? `https://www.youtube.com/watch?v=${suggestion.videoId}`
                : undefined;

              const segments = buildNotificationSegments(n.type, {
                jamName: jam?.name,
                jamHref,
                videoTitle: suggestion?.videoTitle,
                videoHref,
              });

              return (
                <li key={n.id} style={{ color: n.read ? undefined : "var(--accent2)" }}>
                  {!n.read && <span className="stat-badge notif-badge">Nova</span>}
                  <span className="hint-text">
                    <LocalDateTime iso={n.createdAt.toISOString()} />
                  </span>{" "}
                  |{" "}
                  {segments.map((seg, i) =>
                    seg.kind === "link" ? (
                      <a
                        key={i}
                        href={seg.href}
                        className="notif-link"
                        {...(seg.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {seg.text}
                      </a>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
