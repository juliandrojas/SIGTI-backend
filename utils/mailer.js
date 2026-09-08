import nodemailer from "nodemailer";

// 1. Configurar el transporte SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Función reutilizable para despachar correos
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"PETRO-SIGTI Soporte" <${process.env.EMAIL_USER}>`,
      to,      // Destinatario (ej. usuario@petrocasinos.com)
      subject, // Asunto del mensaje
      html,    // Contenido visual en HTML
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado con éxito. ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Fallo al enviar correo mediante Nodemailer:", error.message);
    throw new Error("No se pudo enviar el correo electrónico.");
  }
};