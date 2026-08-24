import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { approveSuggestion, rejectSuggestion } from "./actions";
import { LogoutButton } from "@/components/LogoutButton";

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
  const submitterNames = new Map(submitters.map((u) => [u.id, u.username]));

  return (
    <main className="page">
      <SiteHeader isLoggedIn />

      <div className="statline">
        Logado como{" "}
        <a href="/dashboard">
          <b>{session.user.username ?? session.user.email}</b>
        </a>{" "}
        <span className="sep">|</span> <LogoutButton />
      </div>

      <div className="panel">
        <p className="panel-title">Gerenciar: {jam.name}</p>
        <p className="hint-text">
          Link para compartilhar:{" "}
          <a href={`/j/${jam.slug}`}>/j/{jam.slug}</a>
        </p>
      </div>

      <div className="panel">
        <p className="panel-title">Pendentes ({pending.length})</p>
        {pending.length === 0 ? (
          <p className="hint-text">Nenhuma sugestão pendente.</p>
        ) : (
          <ul className="bullet-list">
            {pending.map((s) => (
              <li key={s.id} className="row" style={{ marginBottom: 6 }}>
                <span>
                  {s.videoTitle} —{" "}
                  <span className="hint-text">
                    {submitterNames.get(s.submittedBy) ?? "?"}
                  </span>
                </span>
                <form action={approveSuggestion}>
                  <input type="hidden" name="suggestionId" value={s.id} />
                  <button type="submit">Aprovar</button>
                </form>
                <form action={rejectSuggestion}>
                  <input type="hidden" name="suggestionId" value={s.id} />
                  <button type="submit">Rejeitar</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel">
        <p className="panel-title">Histórico recente</p>
        {reviewed.length === 0 ? (
          <p className="hint-text">Nada revisado ainda.</p>
        ) : (
          <ul className="bullet-list">
            {reviewed.map((s) => (
              <li key={s.id}>
                {s.videoTitle} —{" "}
                <span className="hint-text">
                  {submitterNames.get(s.submittedBy) ?? "?"} ·{" "}
                  {s.status === "APPROVED" ? "aprovado" : "rejeitado"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="footer">jampla &mdash; MVP</div>
    </main>
  );
}
