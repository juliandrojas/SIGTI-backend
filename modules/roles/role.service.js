import { createRole, getAllRoles, getRoleByName, updateRole } from "./role.repository.js";

export const createRoleService = async (name) => {
    return await createRole(name);
}
export const getAllRolesService = async () => {
    return await getAllRoles();
}
export const getRoleByNameService = async (name) => {
    return await getRoleByName(name);
}
export const updateRoleService = async (id, name) => {
    return await updateRole(id, name);
}