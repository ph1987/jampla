import type { NotificationType } from "@/generated/prisma/enums";
import type { Dictionary } from "@/lib/i18n/dictionary";

export type NotificationSegment =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string; external?: boolean };

export type NotificationRenderContext = {
  jamName?: string;
  jamHref?: string;
  videoTitle?: string;
  videoHref?: string;
};

/**
 * Builds the notification text as segments (plain text + links) instead of a
 * pre-baked string, so the DB only needs to keep `type` + the related ids.
 * Text comes from the caller's dictionary, so it's already localized —
 * the jam/video links stay exactly the same regardless of language.
 */
export function buildNotificationSegments(
  type: NotificationType,
  ctx: NotificationRenderContext,
  dict: Dictionary,
): NotificationSegment[] {
  const t = dict.notifications.message;

  const jam: NotificationSegment = ctx.jamHref
    ? { kind: "link", text: ctx.jamName ?? t.playlistRemoved, href: ctx.jamHref }
    : { kind: "text", text: ctx.jamName ?? t.playlistRemoved };

  const video: NotificationSegment = ctx.videoHref
    ? {
        kind: "link",
        text: ctx.videoTitle ?? t.videoRemoved,
        href: ctx.videoHref,
        external: true,
      }
    : { kind: "text", text: ctx.videoTitle ?? t.videoRemoved };

  switch (type) {
    case "NEW_SUGGESTION":
      return [{ kind: "text", text: t.requestIn }, jam, { kind: "text", text: " → " }, video];
    case "SUGGESTION_APPROVED":
      return [
        { kind: "text", text: t.yourSuggestion },
        video,
        { kind: "text", text: t.wasApprovedIn },
        jam,
      ];
    case "SUGGESTION_REJECTED":
      return [
        { kind: "text", text: t.yourSuggestion },
        video,
        { kind: "text", text: t.wasRejectedIn },
        jam,
      ];
    default:
      return [{ kind: "text", text: type }];
  }
}
