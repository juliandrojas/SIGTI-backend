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