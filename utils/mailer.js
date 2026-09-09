import nodemailer from "nodemailer";

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
  });

  return true;
};

export const sendPasswordResetEmail = async ({ email, token }) => {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error("Faltan EMAIL_USER o EMAIL_PASS para enviar recuperación.");
  }

  const frontendUrl = process.env.FRONTEND_RESET_URL;

  if (!frontendUrl) {
    throw new Error("Falta FRONTEND_RESET_URL para generar el enlace de recuperación.");
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
  });
};