"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getYoutubeClient } from "@/lib/youtube";

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

  revalidatePath(`/jams/${suggestion.jam.slug}`);
}

export async function rejectSuggestion(formData: FormData) {
  const suggestionId = String(formData.get("suggestionId") ?? "");
  const suggestion = await requireOwnedSuggestion(suggestionId);

  await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });

  revalidatePath(`/jams/${suggestion.jam.slug}`);
}
