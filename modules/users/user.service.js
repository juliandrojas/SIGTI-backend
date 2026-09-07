import { createUser, createUserAdmin, getAllUsers, getUser, getUserAdmin, updateUser, updateUserPassword } from "./user.repository.js";

export const createUserAdminService = async (name, email, password) => {
    return await createUserAdmin(name, email, password);
}
export const createUserService = async (name, email, password) => {
    return await createUser(name, email, password);
}
export const getAllUsersService = async () => {
    return await getAllUsers();
}
export const getUserAdminService = async (email) => {
    return await getUserAdmin(email);
}
export const getUserService = async (email) => {
    return await getUser(email);
}
export const updateUserService = async (id, name, email, role) => {
    return updateUser(id, name, email, role);
}
export const updateUserPasswordService = async (id, password) => {
    return updateUserPassword(id, password);
}