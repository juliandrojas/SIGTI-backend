import { getAllRolesService } from "./role.service.js";

export const getAllRolesController = async (req, res) => {
    try {
        const roles = await getAllRolesService();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}