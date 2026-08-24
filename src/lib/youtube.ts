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
