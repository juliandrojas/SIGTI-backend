import { createUserAdminService, createUserService, getAllUsersService, getUserAdminService, getUserService } from "./user.service.js";

export const createUserAdminController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const admin = await createUserAdminService(name, email, password);
        res.status(201).json(admin);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
export const createUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
    const user = await createUserService(name, email, password);
    res.status(201).json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
export const getUserAdminController = async (req, res) => {
    try {
        const userAdmin = await getUserAdminService();
        res.status(200).json(userAdmin);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
export const getUserController = async (req, res) => {
    try {
        const user = await getUserService();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
} 
export const getAllUsersController = async (req, res) => {
    try {
        const users = await getAllUsersService();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
export const updateUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const user = await updateUserService(
            id,
            name,
            email,
            role
        );

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            message: "Usuario actualizado correctamente",
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
};