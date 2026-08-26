import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LogoutButton } from "@/components/LogoutButton";
import { NotificationBadge } from "@/components/NotificationBadge";
import { PendingSuggestionsPanel } from "@/components/PendingSuggestionsPanel";
import { getUserScore } from "@/lib/ranking";

export default async function ManageJamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const jam = await prisma.jam.findUnique({ where: { slug } });
  if (!jam || jam.ownerId !== session.user.id) notFound();

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

  const submitterIds = [
    ...new Set([...pending, ...reviewed].map((s) => s.submittedBy)),
  ];
  const submitters = await prisma.user.findMany({
    where: { id: { in: submitterIds } },
    select: { id: true, username: true },
  });
  const submitterNames = Object.fromEntries(submitters.map((u) => [u.id, u.username]));

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
          ({points}){" "}
          <span className="sep">|</span> <NotificationBadge />
        </span>
        <LogoutButton />
      </div>

      <div className="panel">
        <p className="panel-title">Gerenciar: {jam.name}</p>
        <p className="hint-text">
          Link para compartilhar:{" "}
          <a href={`/j/${jam.slug}`}>/j/{jam.slug}</a>
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

      <SiteFooter />
    </main>
  );
}
