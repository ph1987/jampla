"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getYoutubeClient, extractPlaylistId } from "@/lib/youtube";
import { slugify, randomSuffix } from "@/lib/slug";

export type CreateJamState = { error?: string };

export async function createJam(
  _prevState: CreateJamState,
  formData: FormData,
): Promise<CreateJamState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const name = String(formData.get("name") ?? "").trim();
  const playlistInput = String(formData.get("playlistUrl") ?? "").trim();
  const allowDuplicates = formData.get("allowDuplicates") === "on";
  const requireApproval = formData.get("requireApproval") === "on";
  const maxLinksPerUser = Number(formData.get("maxLinksPerUser") ?? 5);
  const minSecondsBetween = Number(formData.get("minSecondsBetween") ?? 30);

  if (!name) return { error: "Informe um nome para a Jam." };

  const playlistId = extractPlaylistId(playlistInput);
  if (!playlistId) return { error: "Link de playlist inválido." };

  if (!Number.isFinite(maxLinksPerUser) || maxLinksPerUser < 1) {
    return { error: "Máximo de links por convidado inválido." };
  }
  if (!Number.isFinite(minSecondsBetween) || minSecondsBetween < 0) {
    return { error: "Intervalo mínimo entre envios inválido." };
  }

  let youtube;
  try {
    youtube = await getYoutubeClient(session.user.id);
  } catch (err) {
    console.error("getYoutubeClient failed", err);
    return { error: "Conecte sua conta do YouTube antes de criar uma Jam." };
  }

  const [playlistRes, channelRes] = await Promise.all([
    youtube.playlists.list({ part: ["snippet"], id: [playlistId] }),
    youtube.channels.list({ part: ["id"], mine: true }),
  ]);

  const playlist = playlistRes.data.items?.[0];
  if (!playlist) return { error: "Playlist não encontrada." };

  const ownChannelId = channelRes.data.items?.[0]?.id;
  if (!ownChannelId || playlist.snippet?.channelId !== ownChannelId) {
    return { error: "Essa playlist não pertence à sua conta do YouTube." };
  }

  let slug = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${slugify(name) || "jam"}-${randomSuffix()}`;
    const existing = await prisma.jam.findUnique({ where: { slug: candidate } });
    if (!existing) {
      slug = candidate;
      break;
    }
  }
  if (!slug) return { error: "Não foi possível gerar um link único, tente de novo." };

  await prisma.jam.create({
    data: {
      slug,
      name,
      youtubePlaylistId: playlistId,
      ownerId: session.user.id,
      allowDuplicates,
      maxLinksPerUser,
      minSecondsBetween,
      requireApproval,
    },
  });

  redirect("/dashboard");
}
