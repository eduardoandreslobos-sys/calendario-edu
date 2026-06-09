import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Calendario Edu <calendario@nodo.build>";

export async function sendMagicLink(to: string, link: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY no configurado");
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Tu enlace de acceso · Calendario Edu",
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0c0c0d">
        <p style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b6b70;margin:0 0 12px">Calendario Edu</p>
        <h1 style="font-size:22px;font-weight:800;letter-spacing:-0.02em;margin:0 0 8px">Entra a tu calendario</h1>
        <p style="font-size:15px;color:#6b6b70;margin:0 0 24px">Haz clic en el botón para iniciar sesión. El enlace vence en 15 minutos.</p>
        <a href="${link}" style="display:inline-block;background:#0c0c0d;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:12px">Iniciar sesión</a>
        <p style="font-size:12px;color:#9a9aa0;margin:24px 0 0">Si no pediste este acceso, ignora este correo.</p>
      </div>
    `,
  });

  if (error) throw new Error(typeof error === "string" ? error : JSON.stringify(error));
}
