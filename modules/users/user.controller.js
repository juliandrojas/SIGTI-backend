import {
    createUserAdminService,
    createUserService,
    getAllUsersService,
    getUserAdminService,
    getUserService,
    updateUserPasswordService,
    updateUserService
} from "./user.service.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateUserData = ({ name, email, password }, passwordRequired = true) => {
    if (!name || !email || (passwordRequired && !password)) {
        return "name, email y password son obligatorios";
    }

    if (!emailPattern.test(email)) {
        return "El correo electrónico no es válido";
    }

    if (passwordRequired && password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres";
    }

    return null;
};

const sendError = (res, error) => {
    if (error.code === "23505") {
        return res.status(409).json({ message: "El correo electrónico ya está registrado" });
    }

    return res.status(500).json({ message: error.message });
};

export const createUserAdminController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const validationError = validateUserData({ name, email, password });

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const admin = await createUserAdminService(name, email, password);
        res.status(201).json(admin);
    } catch (error) {
        sendError(res, error);
    }
}
export const createUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const validationError = validateUserData({ name, email, password });

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const user = await createUserService(name, email, password);
        res.status(201).json(user);
    } catch (error) {
        sendError(res, error);
    }
}
export const getUserAdminController = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "El correo electrónico es obligatorio" });
        }

        const userAdmin = await getUserAdminService(email);

        if (!userAdmin) {
            return res.status(404).json({ message: "Administrador no encontrado" });
        }

        res.status(200).json(userAdmin);
    } catch (error) {
        sendError(res, error);
    }
}
export const getUserController = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "El correo electrónico es obligatorio" });
        }

        const user = await getUserService(email);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json(user);
    } catch (error) {
        sendError(res, error);
    }
} 
export const getAllUsersController = async (req, res) => {
    try {
        const users = await getAllUsersService();
        res.status(200).json(users);
    } catch (error) {
        sendError(res, error);
    }
}
export const updateUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({ message: "El id del usuario no es válido" });
        }

        const validationError = validateUserData({ name, email }, false);

        if (validationError || !Number.isInteger(Number(role)) || Number(role) <= 0) {
            return res.status(400).json({
                message: validationError || "El rol del usuario no es válido"
            });
        }

        const user = await updateUserService(
            Number(id),
            name,
            email,
            Number(role)
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
        sendError(res, error);
    }
};

export const updateUserPasswordController = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({ message: "El id del usuario no es válido" });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 8 caracteres"
            });
        }

        const user = await updateUserPasswordService(Number(id), password);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({
            message: "Contraseña actualizada correctamente",
            user
        });
    } catch (error) {
        sendError(res, error);
    }
};