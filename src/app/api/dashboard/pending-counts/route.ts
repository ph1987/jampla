import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const jams = await prisma.jam.findMany({
    where: { ownerId: session.user.id },
    select: { id: true },
  });

  const pendingCounts = await prisma.suggestion.groupBy({
    by: ["jamId"],
    where: { jamId: { in: jams.map((j) => j.id) }, status: "PENDING" },
    _count: true,
  });

  const counts = Object.fromEntries(pendingCounts.map((p) => [p.jamId, p._count]));
  return NextResponse.json(counts);
}
