import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "Jampla <onboarding@resend.dev>";

function renderEmailHtml(params: { message: string; buttonText: string; url: string; footer: string }) {
  return `
    <div style="background:#000;padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;color:#ff9955;font-family:'Courier New',Courier,monospace;text-align:center;">
        <p style="color:#ff6600;font-weight:bold;font-size:20px;margin:0 0 16px;">Jampla</p>
        <p style="margin:0 0 20px;">${params.message}</p>
        <p style="margin:0 0 20px;">
          <a href="${params.url}" style="display:inline-block;background:#1a0d00;border:1px solid #ff6600;color:#ff6600;padding:10px 28px;text-decoration:none;font-weight:bold;">${params.buttonText}</a>
        </p>
        <p style="color:#b06a2e;font-size:12px;margin:0 0 4px;">${params.footer}</p>
        <p style="color:#7a3d10;font-size:11px;margin:0;">
          Ou copie e cole este link no navegador:<br />
          <a href="${params.url}" style="color:#ff6600;word-break:break-all;">${params.url}</a>
        </p>
      </div>
    </div>
  `;
}

async function sendEmail(to: string, subject: string, html: string, logLabel: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[jampla] RESEND_API_KEY não configurada — ${logLabel} para ${to}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });

  if (error) {
    console.error(`[jampla] Resend falhou ao enviar para ${to}:`, error);
    throw new Error("Não foi possível enviar o e-mail.");
  }
}

export async function sendVerificationEmail(to: string, url: string) {
  await sendEmail(
    to,
    "Confirme sua conta no Jampla",
    renderEmailHtml({
      message: "Confirme sua conta para poder entrar.",
      buttonText: "Confirmar conta",
      url,
      footer: "Se você não criou essa conta, ignore este e-mail.",
    }),
    "link de verificação",
  );
}

export async function sendResetPasswordEmail(to: string, url: string) {
  await sendEmail(
    to,
    "Redefinir senha no Jampla",
    renderEmailHtml({
      message: "Clique no botão abaixo para escolher uma nova senha.",
      buttonText: "Redefinir senha",
      url,
      footer: "Se você não pediu essa alteração, ignore este e-mail — sua senha continua a mesma.",
    }),
    "link de redefinição de senha",
  );
}
