import { getAllRoles } from "./role.repository.js";

export const getAllRolesService = async () => {
    return await getAllRoles();
}