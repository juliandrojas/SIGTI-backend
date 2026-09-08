import { createRoleService, getAllRolesService, getRoleByNameService, getRoleByIdService, updateRoleService } from "./role.service.js";

export const createRoleController = async (req, res) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({
                message: "El campo name es obligatorio"
            });
        }

        const role = await createRoleService(name.trim());
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

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

export const getRoleByNameController = async (req, res) => {
    try {
        const rol = await getRoleByNameService(req.params.name);

        if (!rol) {
            return res.status(404).json({
                message: "Rol no encontrado"
            });
        }

        res.status(200).json(rol);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

export const getRoleByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validación básica: que el ID sea numérico
    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del rol debe ser un número válido"
      });
    }

    const role = await getRoleByIdService(id);

    if (!role) {
      return res.status(404).json({
        message: "Rol no encontrado"
      });
    }

    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const updateRoleController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const role = await updateRoleService( id, name );
        res.status(200).json({
            message: "Rol actualizado correctamente", role
        })
    } catch (error) {
        console.error(error); res.status(400).json({ message: error.message });
    }
}