import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LogoutButton } from "@/components/LogoutButton";
import { markAllRead } from "./actions";
import { getUserScore } from "@/lib/ranking";

const TYPE_LABEL: Record<string, string> = {
  SUGGESTION_APPROVED: "aprovada",
  SUGGESTION_REJECTED: "recusada",
  NEW_SUGGESTION: "nova sugestão",
};

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
    select: { id: true, slug: true },
  });
  const jamSlugs = new Map(jams.map((j) => [j.id, j.slug]));

  const hasUnread = notifications.some((n) => !n.read);

  const points = await getUserScore(session.user.id);

  return (
    <main className="page">
      <SiteHeader isLoggedIn />

      <div className="statline">
        <span>
          Olá,{" "}
          <a href="/dashboard">
            <b>{session.user.username ?? session.user.email}</b>
          </a>{" "}
          ({points})
        </span>
        <LogoutButton />
      </div>

      <div className="panel">
        <p className="panel-title">Notificações</p>
        {hasUnread && (
          <form action={markAllRead} style={{ marginBottom: 10 }}>
            <button type="submit">Marcar todas como lidas</button>
          </form>
        )}
        {notifications.length === 0 ? (
          <p className="hint-text">Nenhuma notificação ainda.</p>
        ) : (
          <ul className="bullet-list">
            {notifications.map((n) => {
              const slug = n.jamId ? jamSlugs.get(n.jamId) : undefined;
              const href = slug
                ? n.type === "NEW_SUGGESTION"
                  ? `/jams/${slug}`
                  : `/j/${slug}`
                : undefined;
              return (
                <li key={n.id} style={{ color: n.read ? undefined : "var(--accent2)" }}>
                  {href ? <a href={href}>{n.message}</a> : n.message}{" "}
                  <span className="hint-text">
                    · {TYPE_LABEL[n.type] ?? n.type} ·{" "}
                    {n.createdAt.toLocaleString("pt-BR")}
                  </span>
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
