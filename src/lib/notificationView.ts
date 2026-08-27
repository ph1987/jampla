import type { NotificationType } from "@/generated/prisma/enums";

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
 * Adding a new language later means branching on a `locale` here and
 * swapping the literal strings — the jam/video links stay exactly the same.
 */
export function buildNotificationSegments(
  type: NotificationType,
  ctx: NotificationRenderContext,
): NotificationSegment[] {
  const jam: NotificationSegment = ctx.jamHref
    ? { kind: "link", text: ctx.jamName ?? "playlist removida", href: ctx.jamHref }
    : { kind: "text", text: ctx.jamName ?? "playlist removida" };

  const video: NotificationSegment = ctx.videoHref
    ? {
        kind: "link",
        text: ctx.videoTitle ?? "vídeo removido",
        href: ctx.videoHref,
        external: true,
      }
    : { kind: "text", text: ctx.videoTitle ?? "vídeo removido" };

  switch (type) {
    case "NEW_SUGGESTION":
      return [
        { kind: "text", text: "solicitação em " },
        jam,
        { kind: "text", text: " → " },
        video,
      ];
    case "SUGGESTION_APPROVED":
      return [
        { kind: "text", text: "Sua sugestão " },
        video,
        { kind: "text", text: " foi aprovada em " },
        jam,
      ];
    case "SUGGESTION_REJECTED":
      return [
        { kind: "text", text: "Sua sugestão " },
        video,
        { kind: "text", text: " foi recusada em " },
        jam,
      ];
    default:
      return [{ kind: "text", text: type }];
  }
}
