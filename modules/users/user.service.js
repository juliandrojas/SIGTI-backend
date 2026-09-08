import crypto from "node:crypto";
import { sendEmail } from "../../utils/mailer.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import {
    createUser,
    findUserByResetToken,
    findUserForLogin,
    getUsername,
    saveResetToken,
    updatePasswordByResetToken,
} from "./user.repository.js";

export const createUserService = async (userData) => {
    return createUser(userData);
};
export const getUsernameService = async (username) => {
    return getUsername(username);
}
export const findUserForLoginService = async (username, password) => {
    const user = await findUserForLogin(username);
    if(!user) return null;
    const passwordIsValid = await comparePassword(password, user.password);
    if(!passwordIsValid) return null;
    return user;
};

export const requestPasswordResetService = async (email) => {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const user = await saveResetToken(email, tokenHash, expiresAt);

    if (!user) {
        return false;
    }

    const resetUrl = `${process.env.FRONTEND_RESET_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
        to: user.email,
        subject: "Recuperación de contraseña",
        html: `
            <p>Solicitaste cambiar tu contraseña.</p>
            <p>Este enlace expira en 15 minutos:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
        `,
    });
    return true;
};

export const resetPasswordService = async (resetToken, password) => {
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const user = await findUserByResetToken(tokenHash);

    if (!user) {
        return null;
    }

    const passwordHash = await hashPassword(password);
    return updatePasswordByResetToken(tokenHash, passwordHash);
};