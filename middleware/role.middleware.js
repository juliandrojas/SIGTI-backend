import pool from "../config/db.js";

const normalizeRoleName = (roleName = "") =>
  roleName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const requireRoles = ({ roleIds = [], roleNames = [] }) => {
  return async (req, res, next) => {
    try {
      const userId = Number(req.user?.sub);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(403).json({ message: "Permisos requeridos: usuario no válido" });
      }

      const result = await pool.query(
        `SELECT roles.id, roles.name
         FROM users
         INNER JOIN roles ON roles.id = users.role_id
         WHERE users.id = $1
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ message: "Usuario sin rol asignado" });
      }

      const dbRoleId = Number(result.rows[0].id);
      const dbRoleName = normalizeRoleName(result.rows[0].name);

      const normalizedAllowedNames = roleNames.map((name) => normalizeRoleName(name));
      const hasMatchingId = roleIds.length > 0 && roleIds.includes(dbRoleId);
      const hasMatchingName =
        normalizedAllowedNames.length > 0 &&
        normalizedAllowedNames.some((allowed) => allowed === dbRoleName || dbRoleName.includes(allowed));

      if (!hasMatchingId && !hasMatchingName) {
        return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
      }

      req.userRole = { id: dbRoleId, name: result.rows[0].name };
      return next();
    } catch (error) {
      console.error("Error al validar rol:", error.message);
      return res.status(500).json({ message: "No se pudo validar la autorización" });
    }
  };
};

// 1. Administrador y 2. Usuario Área Sistemas
export const requireAdminOrSystems = requireRoles({
  roleIds: [1, 2],
  roleNames: ["administrador", "usuario area sistemas", "area sistemas", "sistemas"],
});

// 3. Usuario Externo (y Administrador para soporte)
export const requireExternalOrAdmin = requireRoles({
  roleIds: [1, 3],
  roleNames: ["usuario externo", "externo", "administrador"],
});

