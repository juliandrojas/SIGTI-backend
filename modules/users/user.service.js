import { comparePassword } from "../../utils/password.js";
import { createUser, findUserForLogin, getUsername } from "./user.repository.js";

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
}