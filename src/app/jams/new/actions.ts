"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getYoutubeClient, extractPlaylistId } from "@/lib/youtube";
import { slugify, randomSuffix } from "@/lib/slug";
import { logActivity } from "@/lib/activityLog";
import { getDictionary } from "@/lib/i18n/server";

export type CreateJamState = { error?: string };

export async function createJam(
  _prevState: CreateJamState,
  formData: FormData,
): Promise<CreateJamState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  const dict = await getDictionary();

  const name = String(formData.get("name") ?? "").trim();
  const createNewPlaylist = formData.get("createNewPlaylist") === "on";
  const playlistInput = String(formData.get("playlistUrl") ?? "").trim();
  const allowDuplicates = formData.get("allowDuplicates") === "on";
  const requireApproval = formData.get("requireApproval") === "on";
  const maxLinksPerUser = Number(formData.get("maxLinksPerUser") ?? 5);
  const minSecondsBetween = Number(formData.get("minSecondsBetween") ?? 30);

  if (!name) return { error: dict.serverErrors.jamNameRequired };

  if (!createNewPlaylist && !extractPlaylistId(playlistInput)) {
    return { error: dict.serverErrors.invalidPlaylistLink };
  }

  if (!Number.isFinite(maxLinksPerUser) || maxLinksPerUser < 1) {
    return { error: dict.serverErrors.invalidMaxLinks };
  }
  if (!Number.isFinite(minSecondsBetween) || minSecondsBetween < 0) {
    return { error: dict.serverErrors.invalidMinInterval };
  }

  let youtube;
  try {
    youtube = await getYoutubeClient(session.user.id);
  } catch (err) {
    console.error("getYoutubeClient failed", err);
    return { error: dict.serverErrors.connectYoutubeFirst };
  }

  let playlistId: string;

  if (createNewPlaylist) {
    try {
      const created = await youtube.playlists.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: { title: name },
          status: { privacyStatus: "unlisted" },
        },
      });
      if (!created.data.id) throw new Error("missing playlist id in response");
      playlistId = created.data.id;
    } catch (err) {
      console.error("playlists.insert failed", err);
      return { error: dict.serverErrors.couldNotCreatePlaylist };
    }
  } else {
    const parsedId = extractPlaylistId(playlistInput);
    if (!parsedId) return { error: dict.serverErrors.invalidPlaylistLink };

    const [playlistRes, channelRes] = await Promise.all([
      youtube.playlists.list({ part: ["snippet"], id: [parsedId] }),
      youtube.channels.list({ part: ["id"], mine: true }),
    ]);

    const playlist = playlistRes.data.items?.[0];
    if (!playlist) return { error: dict.serverErrors.playlistNotFound };

    const ownChannelId = channelRes.data.items?.[0]?.id;
    if (!ownChannelId || playlist.snippet?.channelId !== ownChannelId) {
      return { error: dict.serverErrors.playlistNotYours };
    }

    playlistId = parsedId;
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
  if (!slug) return { error: dict.serverErrors.couldNotGenerateUniqueLink };

  const jam = await prisma.jam.create({
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

  await logActivity({ actorId: session.user.id, action: "jam.create", jamId: jam.id });

  redirect("/dashboard");
}
