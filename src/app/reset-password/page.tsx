import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="page">
      <SiteHeader />

      <div className="panel">
        <p className="panel-title">Redefinir senha</p>
        <ResetPasswordForm token={token} />
      </div>

      <SiteFooter />
    </main>
  );
}
