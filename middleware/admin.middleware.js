import pool from "../config/db.js";

const normalizeRoleName = (roleName = "") =>
  roleName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getAllowedAdminRoles = () => {
  return [normalizeRoleName(process.env.ADMIN_ROLE_NAMES || "administrador")];
};

export const requireAdmin = async (req, res, next) => {
  try {
    const roleId = Number(req.user?.roleId);

    if (!Number.isInteger(roleId) || roleId <= 0) {
      return res.status(403).json({ message: "Permisos de administrador requeridos" });
    }

    const result = await pool.query(
      "SELECT name FROM roles WHERE id = $1 LIMIT 1",
      [roleId]
    );
    const roleName = normalizeRoleName(result.rows[0]?.name);

    if (!roleName || !getAllowedAdminRoles().includes(roleName)) {
      return res.status(403).json({ message: "Permisos de administrador requeridos" });
    }

    return next();
  } catch (error) {
    console.error("No se pudo validar el rol del usuario:", error.message);
    return res.status(500).json({ message: "No se pudo validar la autorización" });
  }
};