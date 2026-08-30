import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchYoutubeVideos } from "@/lib/youtube";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const jam = await prisma.jam.findUnique({ where: { slug } });
  if (!jam) return NextResponse.json({ error: "not found" }, { status: 404 });

  const ban = await prisma.jamBan.findUnique({
    where: { jamId_userId: { jamId: jam.id, userId: session.user.id } },
  });
  if (ban) return NextResponse.json({ error: "banned" }, { status: 403 });

  const results = await searchYoutubeVideos(jam.ownerId, q);
  return NextResponse.json({ results });
}
