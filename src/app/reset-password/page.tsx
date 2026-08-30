import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { getDictionary } from "@/lib/i18n/server";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const dict = await getDictionary();

  return (
    <main className="page">
      <SiteHeader />

      <div className="panel">
        <p className="panel-title">{dict.resetPassword.submit}</p>
        <ResetPasswordForm token={token} />
      </div>

      <SiteFooter />
    </main>
  );
}
