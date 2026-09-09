import pool from "../config/db.js";

const defaultAdminRoleNames = ["admin", "administrador", "administrador de ti"];

const getAllowedRoleNames = () => {
  const configuredNames = process.env.ADMIN_ROLE_NAMES
    ?.split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);

  return configuredNames?.length ? configuredNames : defaultAdminRoleNames;
};

export const authorizeAdmin = async (req, res, next) => {
  try {
    const roleId = req.user?.roleId;

    if (!roleId) {
      return res.status(403).json({ message: "Permisos insuficientes" });
    }

    const result = await pool.query(
      "SELECT name FROM roles WHERE id = $1",
      [roleId]
    );
    const roleName = result.rows[0]?.name?.trim().toLowerCase();

    if (!roleName || !getAllowedRoleNames().includes(roleName)) {
      return res.status(403).json({ message: "Permisos insuficientes" });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
