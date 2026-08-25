import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const jam = await prisma.jam.findUnique({ where: { slug } });
  if (!jam || jam.ownerId !== session.user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const [pending, reviewed] = await Promise.all([
    prisma.suggestion.findMany({
      where: { jamId: jam.id, status: "PENDING" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.suggestion.findMany({
      where: { jamId: jam.id, status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 20,
    }),
  ]);

  const submitterIds = [...new Set([...pending, ...reviewed].map((s) => s.submittedBy))];
  const submitters = await prisma.user.findMany({
    where: { id: { in: submitterIds } },
    select: { id: true, username: true },
  });
  const submitterNames = Object.fromEntries(submitters.map((u) => [u.id, u.username]));

  return NextResponse.json({ pending, reviewed, submitterNames });
}
