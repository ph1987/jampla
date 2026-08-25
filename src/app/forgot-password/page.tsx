import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="page">
      <SiteHeader />

      <div className="panel">
        <p className="panel-title">Esqueci minha senha</p>
        <p className="hint-text">
          Informe o e-mail da sua conta e enviaremos um link para redefinir a
          senha.
        </p>
        <ForgotPasswordForm />
      </div>

      <SiteFooter />
    </main>
  );
}
