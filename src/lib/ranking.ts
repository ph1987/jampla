import { prisma } from "@/lib/prisma";

export async function getUserScore(userId: string): Promise<number> {
  const [approverCount, submitterCount] = await Promise.all([
    prisma.suggestion.count({
      where: { status: "APPROVED", jam: { ownerId: userId } },
    }),
    prisma.suggestion.count({
      where: { status: "APPROVED", submittedBy: userId, jam: { ownerId: { not: userId } } },
    }),
  ]);
  return approverCount * 1 + submitterCount * 3;
}
