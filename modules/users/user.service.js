import { comparePassword } from "../../utils/password.js";
import { sendWelcomeEmail } from "../../utils/mailer.js";
import { createUser, findUserForLogin, getUsername } from "./user.repository.js";

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