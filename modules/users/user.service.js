import { sendPasswordResetEmail, sendWelcomeEmail } from "../../utils/mailer.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { createResetToken, hashResetToken } from "../../utils/resetPassword.js";
import {
    createUser,
    findUserForLogin,
    getUsername,
    saveResetToken,
    updatePasswordByResetToken,
} from "./user.repository.js";

export const createUserService = async (userData) => {
    const user = await createUser(userData);
    let emailSent = false;

    try {
        emailSent = await sendWelcomeEmail(user);
    } catch (error) {
        console.error("No se pudo enviar el correo de bienvenida:", error.message);
    }

    return { ...user, emailSent };
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
}

export const requestPasswordResetService = async (email) => {
    if (!email?.trim()) {
        throw new Error("El correo es obligatorio");
    }

    const { token, tokenHash, expiresAt } = createResetToken();
    const user = await saveResetToken(email, tokenHash, expiresAt);

    if (!user) {
        return false;
    }

    await sendPasswordResetEmail({ email: user.email, token });
    return true;
};

export const resetPasswordService = async (token, password) => {
    if (!token?.trim() || !password?.trim() || password.length < 6) {
        throw new Error("El token y una contraseña de al menos 6 caracteres son obligatorios");
    }

    const tokenHash = hashResetToken(token);
    const hashedPassword = await hashPassword(password);
    const passwordUpdated = await updatePasswordByResetToken(tokenHash, hashedPassword);

    if (!passwordUpdated) {
        throw new Error("El enlace de recuperación no es válido o ha expirado");
    }
};