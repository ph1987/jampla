import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CreateJamForm } from "@/components/CreateJamForm";
import { LogoutButton } from "@/components/LogoutButton";
import { PointsBadge } from "@/components/PointsBadge";
import { getUserScore } from "@/lib/ranking";
import { getDictionary } from "@/lib/i18n/server";

export default async function NewJamPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const youtubeAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
  });
  if (!youtubeAccount) redirect("/dashboard");

  const points = await getUserScore(session.user.id);
  const dict = await getDictionary();

  return (
    <main className="page">
      <SiteHeader isLoggedIn />

      <div className="statline">
        <span>
          {dict.common.greeting}{" "}
          <a href="/dashboard">
            <b>{session.user.username ?? session.user.email}</b>
          </a>
          <PointsBadge points={points} />
        </span>
        <LogoutButton />
      </div>

      <div className="panel">
        <p className="panel-title">{dict.jamsNew.title}</p>
        <CreateJamForm />
      </div>
      <SiteFooter />
    </main>
  );
}
