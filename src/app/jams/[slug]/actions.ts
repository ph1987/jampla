"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getYoutubeClient, removeVideoFromPlaylist } from "@/lib/youtube";
import { logActivity } from "@/lib/activityLog";
import { createNotification } from "@/lib/notifications";

async function requireOwnedSuggestion(suggestionId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const suggestion = await prisma.suggestion.findUnique({
    where: { id: suggestionId },
    include: { jam: true },
  });
  if (!suggestion || suggestion.jam.ownerId !== session.user.id) {
    throw new Error("Sugestão não encontrada.");
  }
  return suggestion;
}

export async function approveSuggestion(formData: FormData) {
  const suggestionId = String(formData.get("suggestionId") ?? "");
  const suggestion = await requireOwnedSuggestion(suggestionId);

  const youtube = await getYoutubeClient(suggestion.jam.ownerId);
  await youtube.playlistItems.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        playlistId: suggestion.jam.youtubePlaylistId,
        resourceId: { kind: "youtube#video", videoId: suggestion.videoId },
      },
    },
  });

  await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status: "APPROVED", reviewedAt: new Date() },
  });

  await prisma.notification.updateMany({
    where: { suggestionId: suggestion.id, type: "NEW_SUGGESTION" },
    data: { read: true },
  });

  await logActivity({
    actorId: suggestion.jam.ownerId,
    action: "suggestion.approve",
    jamId: suggestion.jamId,
    suggestionId: suggestion.id,
  });
  if (suggestion.submittedBy !== suggestion.jam.ownerId) {
    await createNotification({
      userId: suggestion.submittedBy,
      type: "SUGGESTION_APPROVED",
      message: `Sua sugestão "${suggestion.videoTitle}" foi aprovada em "${suggestion.jam.name}".`,
      jamId: suggestion.jamId,
      suggestionId: suggestion.id,
    });
  }

  revalidatePath(`/j/${suggestion.jam.slug}`);
}

export async function removeSuggestion(formData: FormData) {
  const suggestionId = String(formData.get("suggestionId") ?? "");
  const suggestion = await requireOwnedSuggestion(suggestionId);

  if (suggestion.status !== "APPROVED") {
    throw new Error("Só é possível remover músicas já aprovadas na playlist.");
  }

  const result = await removeVideoFromPlaylist(
    suggestion.jam.ownerId,
    suggestion.jam.youtubePlaylistId,
    suggestion.videoId,
  );
  // If it's already gone from the YouTube playlist, still update our own
  // record instead of leaving a stale "aprovado" entry stuck forever.
  if (!result.ok && result.error !== "NOT_FOUND_IN_PLAYLIST") {
    throw new Error("Não foi possível remover o vídeo da playlist no YouTube.");
  }

  // Marked as REMOVED, not deleted — the points/ranking already earned for
  // this approval stay valid even after the song leaves the playlist.
  await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status: "REMOVED", reviewedAt: new Date() },
  });

  await logActivity({
    actorId: suggestion.jam.ownerId,
    action: "suggestion.remove",
    jamId: suggestion.jamId,
    suggestionId: suggestion.id,
  });

  revalidatePath(`/j/${suggestion.jam.slug}`);
}

export async function rejectSuggestion(formData: FormData) {
  const suggestionId = String(formData.get("suggestionId") ?? "");
  const suggestion = await requireOwnedSuggestion(suggestionId);

  await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });

  await prisma.notification.updateMany({
    where: { suggestionId: suggestion.id, type: "NEW_SUGGESTION" },
    data: { read: true },
  });

  await logActivity({
    actorId: suggestion.jam.ownerId,
    action: "suggestion.reject",
    jamId: suggestion.jamId,
    suggestionId: suggestion.id,
  });
  if (suggestion.submittedBy !== suggestion.jam.ownerId) {
    await createNotification({
      userId: suggestion.submittedBy,
      type: "SUGGESTION_REJECTED",
      message: `Sua sugestão "${suggestion.videoTitle}" foi recusada em "${suggestion.jam.name}".`,
      jamId: suggestion.jamId,
      suggestionId: suggestion.id,
    });
  }

  revalidatePath(`/j/${suggestion.jam.slug}`);
}
