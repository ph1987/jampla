"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractVideoId, fetchVideoInfo, getYoutubeClient } from "@/lib/youtube";
import { logActivity } from "@/lib/activityLog";
import { createNotification } from "@/lib/notifications";
import { getDictionary } from "@/lib/i18n/server";

export type SubmitLinkState = { error?: string; success?: string };

export async function submitLink(
  slug: string,
  _prevState: SubmitLinkState,
  formData: FormData,
): Promise<SubmitLinkState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/?next=/j/${slug}`);
  const dict = await getDictionary();

  const jam = await prisma.jam.findUnique({ where: { slug } });
  if (!jam) return { error: dict.serverErrors.jamNotFound };

  const ban = await prisma.jamBan.findUnique({
    where: { jamId_userId: { jamId: jam.id, userId: session.user.id } },
  });
  if (ban) return { error: dict.serverErrors.bannedFromJam };

  const linkInput = String(formData.get("videoUrl") ?? "").trim();
  const videoId = extractVideoId(linkInput);
  if (!videoId) return { error: dict.serverErrors.invalidVideoLink };

  if (!jam.allowDuplicates) {
    const duplicate = await prisma.suggestion.findFirst({
      where: { jamId: jam.id, videoId, status: { not: "REJECTED" } },
    });
    if (duplicate) return { error: dict.serverErrors.alreadyAdded };
  }

  const submissionCount = await prisma.suggestion.count({
    where: { jamId: jam.id, submittedBy: session.user.id, status: { not: "REJECTED" } },
  });
  if (submissionCount >= jam.maxLinksPerUser) {
    return { error: dict.serverErrors.submissionLimit(jam.maxLinksPerUser) };
  }

  const lastSubmission = await prisma.suggestion.findFirst({
    where: { jamId: jam.id, submittedBy: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  if (lastSubmission) {
    const secondsSince = (Date.now() - lastSubmission.createdAt.getTime()) / 1000;
    if (secondsSince < jam.minSecondsBetween) {
      const wait = Math.ceil(jam.minSecondsBetween - secondsSince);
      return { error: dict.serverErrors.waitBeforeNext(wait) };
    }
  }

  const videoInfo = await fetchVideoInfo(videoId);
  if (!videoInfo) return { error: dict.serverErrors.videoNotFound };

  if (jam.requireApproval) {
    const suggestion = await prisma.suggestion.create({
      data: {
        jamId: jam.id,
        videoId,
        videoTitle: videoInfo.title,
        thumbnailUrl: videoInfo.thumbnailUrl,
        submittedBy: session.user.id,
        status: "PENDING",
      },
    });
    await logActivity({
      actorId: session.user.id,
      action: "suggestion.submit",
      jamId: jam.id,
      suggestionId: suggestion.id,
    });
    if (session.user.id !== jam.ownerId) {
      await createNotification({
        userId: jam.ownerId,
        type: "NEW_SUGGESTION",
        message: `solicitação em ${jam.name}`,
        jamId: jam.id,
        suggestionId: suggestion.id,
      });
    }
    revalidatePath(`/j/${slug}`);
    return { success: dict.serverErrors.sentAwaitingApproval };
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
    return { error: dict.serverErrors.couldNotAddToPlaylist };
  }

  const suggestion = await prisma.suggestion.create({
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
  await logActivity({
    actorId: session.user.id,
    action: "suggestion.submit",
    jamId: jam.id,
    suggestionId: suggestion.id,
    metadata: { autoApproved: true },
  });
  revalidatePath(`/j/${slug}`);
  return { success: dict.serverErrors.addedToPlaylist };
}
