import { sendPasswordResetEmail } from "../../utils/mailer.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { generateResetToken, getResetTokenExpiry, hashResetToken } from "../../utils/resetPassword.js";
import {
    createUser,
    findUserByEmail,
    findUserByResetToken,
    findUserForLogin,
    getUsername,
    saveResetToken,
    updatePasswordById,
} from "./user.repository.js";

export const createUserService = async (userData) => {
  return createUser(userData);
};

export const getUsernameService = async (username) => {
  return getUsername(username);
};

export const findUserForLoginService = async (username, password) => {
  const user = await findUserForLogin(username);
  if (!user) return null;

  const passwordIsValid = await comparePassword(password, user.password);
  if (!passwordIsValid) return null;

  return user;
};

export const requestPasswordResetService = async (email) => {
  const normalizedEmail = email?.trim();

  if (!normalizedEmail) {
    throw new Error("El correo electrónico es obligatorio.");
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return {
      success: true,
      message: "Si el correo existe, se enviaron instrucciones para recuperar la contraseña.",
    };
  }

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = getResetTokenExpiry(15);

  await saveResetToken(user.email, tokenHash, expiresAt);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/recovery/${token}`;

  await sendPasswordResetEmail({
    email: user.email,
    name: user.name || "usuario",
    resetUrl,
  });

  return {
    success: true,
    message: "Si el correo existe, se enviaron instrucciones para recuperar la contraseña.",
  };
};

export const resetPasswordService = async ({ token, password, newPassword }) => {
  const newPass = password ?? newPassword;

  if (!token || !newPass) {
    throw new Error("Token y contraseña son obligatorios.");
  }

  const hashedToken = hashResetToken(token);
  const user = await findUserByResetToken(hashedToken);

  if (!user) {
    throw new Error("El enlace de recuperación es inválido o ha expirado.");
  }

  const hashedPasswordValue = await hashPassword(newPass);
  await updatePasswordById(user.id, hashedPasswordValue);

  return {
    success: true,
    message: "Contraseña actualizada correctamente.",
  };
};