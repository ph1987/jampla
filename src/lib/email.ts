import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "Jampla <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, url: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[jampla] RESEND_API_KEY não configurada — link de verificação para ${to}: ${url}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Confirme sua conta no Jampla",
    html: `
      <div style="background:#000;color:#ff9955;font-family:'Courier New',Courier,monospace;padding:32px 24px;text-align:center;">
        <p style="color:#ff6600;font-weight:bold;font-size:20px;margin:0 0 16px;">Jampla</p>
        <p style="margin:0 0 20px;">Confirme sua conta para poder entrar.</p>
        <p style="margin:0 0 20px;">
          <a href="${url}" style="display:inline-block;background:#1a0d00;border:1px solid #ff6600;color:#ff6600;padding:10px 28px;text-decoration:none;font-weight:bold;">Confirmar conta</a>
        </p>
        <p style="color:#b06a2e;font-size:12px;margin:0 0 4px;">Se você não criou essa conta, ignore este e-mail.</p>
        <p style="color:#7a3d10;font-size:11px;margin:0;">Ou copie e cole este link no navegador: ${url}</p>
      </div>
    `,
  });

  if (error) {
    console.error(`[jampla] Resend falhou ao enviar para ${to}:`, error);
    throw new Error("Não foi possível enviar o e-mail de confirmação.");
  }
}
