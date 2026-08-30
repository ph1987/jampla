import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { getDictionary } from "@/lib/i18n/server";

export default async function ForgotPasswordPage() {
  const dict = await getDictionary();

  return (
    <main className="page">
      <SiteHeader />

      <div className="panel">
        <p className="panel-title">{dict.forgotPassword.pageTitle}</p>
        <p className="hint-text">{dict.forgotPassword.pageHint}</p>
        <ForgotPasswordForm />
      </div>

      <SiteFooter />
    </main>
  );
}
