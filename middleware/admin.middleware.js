import pool from "../config/db.js";

const getAllowedAdminRoles = () => {
  const configuredRoles = process.env.ADMIN_ROLE_NAMES || "admin,administrador";

  return configuredRoles
    .split(",")
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
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
    const roleName = result.rows[0]?.name?.trim().toLowerCase();

    if (!roleName || !getAllowedAdminRoles().includes(roleName)) {
      return res.status(403).json({ message: "Permisos de administrador requeridos" });
    }

    return next();
  } catch (error) {
    console.error("No se pudo validar el rol del usuario:", error.message);
    return res.status(500).json({ message: "No se pudo validar la autorización" });
  }
};