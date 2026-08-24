import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "jampla <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, url: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[jampla] RESEND_API_KEY não configurada — link de verificação para ${to}: ${url}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Confirme sua conta no jampla",
    html: `
      <div style="background:#000;color:#ff9955;font-family:'Courier New',Courier,monospace;padding:24px;">
        <p style="color:#ff6600;font-weight:bold;">jampla</p>
        <p>Confirme sua conta clicando no link abaixo:</p>
        <p><a href="${url}" style="color:#ff8800;">${url}</a></p>
        <p style="color:#b06a2e;font-size:12px;">Se você não criou essa conta, ignore este e-mail.</p>
      </div>
    `,
  });

  if (error) {
    console.error(`[jampla] Resend falhou ao enviar para ${to}:`, error);
    throw new Error("Não foi possível enviar o e-mail de confirmação.");
  }
}
