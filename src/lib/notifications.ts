import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/enums";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  message: string;
  jamId?: string;
  suggestionId?: string;
}) {
  await prisma.notification.create({ data: params });
}
