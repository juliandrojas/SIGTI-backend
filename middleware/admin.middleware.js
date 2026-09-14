import pool from "../config/db.js";

const normalizeRoleName = (roleName = "") =>
  roleName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const isSystemsAdministrator = (roleId, roleName) =>
  Number(roleId) === 1 || ["administrador", "sistemas"].includes(normalizeRoleName(roleName));

export const requireAdmin = async (req, res, next) => {
  try {
    const userId = Number(req.user?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(403).json({ message: "Permisos de administrador requeridos" });
    }

    const result = await pool.query(
      `SELECT roles.id, roles.name
       FROM users
       INNER JOIN roles ON roles.id = users.role_id
       WHERE users.id = $1
       LIMIT 1`,
      [userId]
    );
    if (!isSystemsAdministrator(result.rows[0]?.id, result.rows[0]?.name)) {
      return res.status(403).json({ message: "Permisos de administrador requeridos" });
    }

    return next();
  } catch (error) {
    console.error("No se pudo validar el rol del usuario:", error.message);
    return res.status(500).json({ message: "No se pudo validar la autorización" });
  }
};
