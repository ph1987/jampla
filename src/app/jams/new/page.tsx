import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { CreateJamForm } from "@/components/CreateJamForm";
import { LogoutButton } from "@/components/LogoutButton";

export default async function NewJamPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const youtubeAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
  });
  if (!youtubeAccount) redirect("/dashboard");

  return (
    <main className="page">
      <SiteHeader isLoggedIn />

      <div className="statline">
        Logado como{" "}
        <a href="/dashboard">
          <b>{session.user.username ?? session.user.email}</b>
        </a>{" "}
        <span className="sep">|</span> <LogoutButton />
      </div>

      <div className="panel">
        <p className="panel-title">Criar Jam</p>
        <CreateJamForm />
      </div>
      <div className="footer">jampla &mdash; MVP</div>
    </main>
  );
}
