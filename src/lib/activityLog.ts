import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function logActivity(params: {
  actorId: string;
  action: string;
  jamId?: string;
  suggestionId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.activityLog.create({ data: params });
}
