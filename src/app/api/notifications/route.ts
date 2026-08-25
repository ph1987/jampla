import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [unreadCount, notifications] = await Promise.all([
    prisma.notification.count({ where: { userId: session.user.id, read: false } }),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const jamIds = [...new Set(notifications.map((n) => n.jamId).filter((id): id is string => !!id))];
  const jams = await prisma.jam.findMany({
    where: { id: { in: jamIds } },
    select: { id: true, slug: true },
  });
  const jamSlugs = Object.fromEntries(jams.map((j) => [j.id, j.slug]));

  return NextResponse.json({
    unreadCount,
    notifications: notifications.map((n) => ({
      ...n,
      jamSlug: n.jamId ? jamSlugs[n.jamId] : null,
    })),
  });
}
