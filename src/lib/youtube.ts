import { google } from "googleapis";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getYoutubeClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "google" },
  });
  if (!account) {
    throw new Error("YOUTUBE_NOT_CONNECTED");
  }

  const { accessToken } = await auth.api.getAccessToken({
    body: { accountId: account.id, userId },
  });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.youtube({ version: "v3", auth: oauth2Client });
}

export async function getYoutubeChannelInfo(
  userId: string,
): Promise<{ title: string; thumbnailUrl: string } | null> {
  try {
    const youtube = await getYoutubeClient(userId);
    const res = await youtube.channels.list({ part: ["snippet"], mine: true });
    const channel = res.data.items?.[0];
    const thumbnailUrl = channel?.snippet?.thumbnails?.default?.url;
    if (!channel || !thumbnailUrl) return null;
    return { title: channel.snippet?.title ?? "", thumbnailUrl };
  } catch (err) {
    console.error("getYoutubeChannelInfo failed", err);
    return null;
  }
}

export type PlaylistVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
};

async function fetchPlaylistItemsOnce(
  ownerId: string,
  playlistId: string,
): Promise<PlaylistVideo[]> {
  const youtube = await getYoutubeClient(ownerId);
  const res = await youtube.playlistItems.list({
    part: ["snippet"],
    playlistId,
    maxResults: 50,
  });
  return (res.data.items ?? [])
    .map((item) => ({
      videoId: item.snippet?.resourceId?.videoId ?? "",
      title: item.snippet?.title ?? "",
      channelTitle:
        item.snippet?.videoOwnerChannelTitle ?? item.snippet?.channelTitle ?? "",
      thumbnailUrl:
        item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? "",
    }))
    .filter((item) => item.videoId);
}

export async function getPlaylistItems(
  ownerId: string,
  playlistId: string,
): Promise<{ items: PlaylistVideo[]; error: boolean }> {
  try {
    return { items: await fetchPlaylistItemsOnce(ownerId, playlistId), error: false };
  } catch (err) {
    console.error("getPlaylistItems failed, forcing a token refresh and retrying once", err);
    // Better Auth only refreshes the stored Google token when its own
    // `accessTokenExpiresAt` bookkeeping says it's due — that can drift out
    // of sync with what Google actually accepts. Force a refresh once and
    // retry before giving up, instead of surfacing a stale-token error.
    try {
      const account = await prisma.account.findFirst({
        where: { userId: ownerId, providerId: "google" },
      });
      if (!account) throw new Error("YOUTUBE_NOT_CONNECTED");
      await auth.api.refreshToken({ body: { accountId: account.id, userId: ownerId } });
      return { items: await fetchPlaylistItemsOnce(ownerId, playlistId), error: false };
    } catch (retryErr) {
      console.error("getPlaylistItems retry after refresh failed", retryErr);
      return { items: [], error: true };
    }
  }
}

export async function removeVideoFromPlaylist(
  ownerId: string,
  playlistId: string,
  videoId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const youtube = await getYoutubeClient(ownerId);

    // playlistItems.delete needs the playlist ITEM id, not the video id, so
    // find it first by paging through the playlist looking for this video.
    let pageToken: string | undefined;
    let playlistItemId: string | undefined;
    do {
      const res = await youtube.playlistItems.list({
        part: ["id", "snippet"],
        playlistId,
        maxResults: 50,
        pageToken,
      });
      playlistItemId = (res.data.items ?? []).find(
        (item) => item.snippet?.resourceId?.videoId === videoId,
      )?.id ?? undefined;
      pageToken = res.data.nextPageToken ?? undefined;
    } while (!playlistItemId && pageToken);

    if (!playlistItemId) return { ok: false, error: "NOT_FOUND_IN_PLAYLIST" };

    await youtube.playlistItems.delete({ id: playlistItemId });
    return { ok: true };
  } catch (err) {
    console.error("removeVideoFromPlaylist failed", err);
    return { ok: false, error: "REQUEST_FAILED" };
  }
}

export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const vParam = url.searchParams.get("v");
    if (vParam) return vParam;
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1);
      if (id) return id;
    }
    const shortsMatch = url.pathname.match(/\/shorts\/([A-Za-z0-9_-]{6,})/);
    if (shortsMatch) return shortsMatch[1];
  } catch {
    // not a URL, fall through to treat input as a raw video ID
  }
  if (/^[A-Za-z0-9_-]{10,12}$/.test(trimmed)) return trimmed;
  return null;
}

export async function fetchVideoInfo(
  videoId: string,
): Promise<{ title: string; thumbnailUrl: string } | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  return { title: data.title, thumbnailUrl: data.thumbnail_url };
}

export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const listParam = url.searchParams.get("list");
    if (listParam) return listParam;
  } catch {
    // not a URL, fall through to treat input as a raw playlist ID
  }
  if (/^[A-Za-z0-9_-]{10,}$/.test(trimmed)) return trimmed;
  return null;
}
