"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractVideoId, fetchVideoInfo, getYoutubeClient } from "@/lib/youtube";

export type SubmitLinkState = { error?: string; success?: string };

export async function submitLink(
  slug: string,
  _prevState: SubmitLinkState,
  formData: FormData,
): Promise<SubmitLinkState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/?next=/j/${slug}`);

  const jam = await prisma.jam.findUnique({ where: { slug } });
  if (!jam) return { error: "Jam não encontrada." };

  const ban = await prisma.jamBan.findUnique({
    where: { jamId_userId: { jamId: jam.id, userId: session.user.id } },
  });
  if (ban) return { error: "Você foi removido desta Jam." };

  const linkInput = String(formData.get("videoUrl") ?? "").trim();
  const videoId = extractVideoId(linkInput);
  if (!videoId) return { error: "Link de vídeo inválido." };

  if (!jam.allowDuplicates) {
    const duplicate = await prisma.suggestion.findFirst({
      where: { jamId: jam.id, videoId, status: { not: "REJECTED" } },
    });
    if (duplicate) return { error: "Esse vídeo já foi adicionado a esta Jam." };
  }

  const submissionCount = await prisma.suggestion.count({
    where: { jamId: jam.id, submittedBy: session.user.id, status: { not: "REJECTED" } },
  });
  if (submissionCount >= jam.maxLinksPerUser) {
    return { error: `Você atingiu o limite de ${jam.maxLinksPerUser} links nesta Jam.` };
  }

  const lastSubmission = await prisma.suggestion.findFirst({
    where: { jamId: jam.id, submittedBy: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  if (lastSubmission) {
    const secondsSince = (Date.now() - lastSubmission.createdAt.getTime()) / 1000;
    if (secondsSince < jam.minSecondsBetween) {
      const wait = Math.ceil(jam.minSecondsBetween - secondsSince);
      return { error: `Aguarde ${wait}s antes de enviar outro link.` };
    }
  }

  const videoInfo = await fetchVideoInfo(videoId);
  if (!videoInfo) return { error: "Não foi possível encontrar esse vídeo." };

  if (jam.requireApproval) {
    await prisma.suggestion.create({
      data: {
        jamId: jam.id,
        videoId,
        videoTitle: videoInfo.title,
        thumbnailUrl: videoInfo.thumbnailUrl,
        submittedBy: session.user.id,
        status: "PENDING",
      },
    });
    revalidatePath(`/j/${slug}`);
    return { success: "Link enviado! Aguardando aprovação." };
  }

  try {
    const youtube = await getYoutubeClient(jam.ownerId);
    await youtube.playlistItems.insert({
      part: ["snippet"],
      requestBody: {
        snippet: {
          playlistId: jam.youtubePlaylistId,
          resourceId: { kind: "youtube#video", videoId },
        },
      },
    });
  } catch (err) {
    console.error("playlistItems.insert failed", err);
    return { error: "Não foi possível adicionar o vídeo à playlist." };
  }

  await prisma.suggestion.create({
    data: {
      jamId: jam.id,
      videoId,
      videoTitle: videoInfo.title,
      thumbnailUrl: videoInfo.thumbnailUrl,
      submittedBy: session.user.id,
      status: "APPROVED",
      reviewedAt: new Date(),
    },
  });
  revalidatePath(`/j/${slug}`);
  return { success: "Adicionado à playlist!" };
}
