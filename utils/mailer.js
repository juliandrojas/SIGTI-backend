import nodemailer from "nodemailer";

const getMailConfig = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const password = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST;
  const service = process.env.SMTP_SERVICE;

  if ((!host && !service) || !user || !password) {
    return null;
  }

  return {
    host,
    service,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: { user, pass: password },
  };
};

const createTransporter = () => {
  const config = getMailConfig();

  if (!config) {
    return null;
  }

  return nodemailer.createTransport(config);
};

export const sendWelcomeEmail = async ({ email, name, username }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return false;
  }

  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
  const frontendUrl = process.env.FRONTEND_URL || process.env.FRONTEND_RESET_URL || "http://localhost:5173";

  await transporter.sendMail({
    from,
    to: email,
    subject: "Bienvenido a PETRO-SIGTI",
    text: `Hola ${name}, tu cuenta fue creada correctamente. Tu usuario es: ${username}. Puedes iniciar sesión en ${frontendUrl}/login.`,
    html: `
      <p>Hola ${name},</p>
      <p>Tu cuenta de PETRO-SIGTI fue creada correctamente.</p>
      <p>Tu usuario es: <strong>${username}</strong></p>
      <p><a href="${frontendUrl}/login">Iniciar sesión</a></p>
    `,
  });

  return true;
};
