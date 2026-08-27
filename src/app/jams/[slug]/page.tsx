import { redirect } from "next/navigation";

// Rota antiga de gerenciar Jam, unificada com /j/[slug] — que agora mostra a
// visão de dono (link pra compartilhar, playlist, pendentes/histórico) pra
// quem é o owner, e a visão de convidado pra todo mundo. Mantido como
// redirect pra não quebrar links/favoritos antigos.
export default async function LegacyManageJamRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/j/${slug}`);
}
