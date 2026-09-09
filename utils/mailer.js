import nodemailer from "nodemailer";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "").replace(/\/$/, "");

const renderEmail = ({ preheader, title, greeting, content, details = [], action, note }) => {
  const detailsHtml = details.length
    ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin: 24px 0; background: #f4f7fa; border: 1px solid #e3eaf0; border-radius: 8px;">
        ${details
          .map(
            ({ label, value }) => `
              <tr>
                <td style="padding: 14px 16px; color: #627386; font-size: 13px; border-bottom: 1px solid #e3eaf0;">${escapeHtml(label)}</td>
                <td style="padding: 14px 16px; color: #17324d; font-size: 14px; font-weight: 700; text-align: right; border-bottom: 1px solid #e3eaf0;">${escapeHtml(value)}</td>
              </tr>`
          )
          .join("")}
      </table>`
    : "";

  const actionHtml = action
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0 24px;">
        <tr>
          <td style="border-radius: 6px; background: #0b7189;">
            <a href="${escapeHtml(action.href)}" style="display: inline-block; padding: 13px 22px; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none;">${escapeHtml(action.label)}</a>
          </td>
        </tr>
      </table>`
    : "";

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin: 0; padding: 0; background: #eef3f6; color: #30465a; font-family: Arial, Helvetica, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(preheader)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #eef3f6; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #ffffff; border-collapse: collapse; border: 1px solid #dce5eb;">
                <tr>
                  <td style="padding: 24px 32px; background: #17324d; color: #ffffff;">
                    <div style="font-size: 19px; font-weight: 700; letter-spacing: 0.2px;">PETRO-SIGTI</div>
                    <div style="margin-top: 5px; color: #b8d9df; font-size: 12px;">Gestión de tecnología y soporte institucional</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px 32px 28px;">
                    <div style="margin-bottom: 10px; color: #0b7189; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">PETRO-SIGTI</div>
                    <h1 style="margin: 0 0 18px; color: #17324d; font-size: 25px; line-height: 1.25;">${escapeHtml(title)}</h1>
                    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">${escapeHtml(greeting)}</p>
                    <div style="font-size: 15px; line-height: 1.7;">${content}</div>
                    ${detailsHtml}
                    ${actionHtml}
                    <p style="margin: 20px 0 0; color: #718096; font-size: 13px; line-height: 1.6;">${escapeHtml(note)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 32px; border-top: 1px solid #e3eaf0; color: #8291a0; font-size: 12px; line-height: 1.6;">
                    Este mensaje fue enviado automáticamente por PETRO-SIGTI.<br>
                    Por favor, no respondas directamente a este correo.
                  </td>
                </tr>
              </table>
              <div style="max-width: 600px; padding: 16px 20px 0; color: #8291a0; font-size: 11px; line-height: 1.5;">Mensaje generado para uso institucional.</div>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
};

const getTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS, SMTP_SERVICE = "gmail" } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: SMTP_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

export const sendWelcomeEmail = async ({ email, name, username }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn("Correo de bienvenida omitido: faltan EMAIL_USER o EMAIL_PASS.");
    return false;
  }

  const frontendUrl = getFrontendUrl();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Bienvenido a PETRO-SIGTI",
    text: [
      `Hola ${name},`,
      "",
      "Tu cuenta de PETRO-SIGTI fue creada correctamente.",
      `Tu nombre de usuario es: ${username}`,
      "",
      "Ya puedes ingresar al sistema con la contraseña que registraste.",
    ].join("\n"),
    html: renderEmail({
      preheader: "Tu cuenta de PETRO-SIGTI fue creada correctamente.",
      title: "Tu cuenta está lista",
      greeting: `Hola ${name},`,
      content: "Tu cuenta de PETRO-SIGTI fue creada correctamente. Ya puedes ingresar al sistema con la contraseña que registraste.",
      details: [{ label: "Nombre de usuario", value: username }],
      action: frontendUrl ? { label: "Ingresar al sistema", href: `${frontendUrl}/login` } : null,
      note: "Si no solicitaste esta cuenta, informa al equipo de soporte institucional.",
    }),
  });

  return true;
};

export const sendPasswordResetEmail = async ({ email, token }) => {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error("Faltan EMAIL_USER o EMAIL_PASS para enviar recuperación.");
  }

  const frontendUrl = getFrontendUrl();

  if (!frontendUrl) {
    throw new Error("Falta FRONTEND_URL para generar el enlace de recuperación.");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Restablece tu contraseña de PETRO-SIGTI",
    text: [
      "Recibimos una solicitud para restablecer tu contraseña.",
      "",
      `Abre este enlace para continuar: ${frontendUrl.replace(/\/$/, "")}/recovery/${token}`,
      "",
      "El enlace vence en 15 minutos. Si no solicitaste este cambio, ignora este mensaje.",
    ].join("\n"),
    html: renderEmail({
      preheader: "Recibimos una solicitud para restablecer tu contraseña.",
      title: "Restablece tu contraseña",
      greeting: "Hola,",
      content: "Recibimos una solicitud para restablecer la contraseña de tu cuenta PETRO-SIGTI. Haz clic en el botón para continuar.",
      action: { label: "Restablecer contraseña", href: `${frontendUrl}/recovery/${token}` },
      note: "Este enlace vence en 15 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.",
    }),
  });
};