import pool from "../../config/db.js";

export const createRole = async (name) => {
    const query = "INSERT INTO roles (name) VALUES ($1) RETURNING *";
    const result = await pool.query(query, [name]);
    return result.rows[0];
}
export const getAllRoles = async () => {
    const result = await pool.query("SELECT * FROM roles");
    return result.rows;
}
export const getRoleByName = async (name) => {
    const query = "SELECT * FROM roles WHERE LOWER(name) = LOWER($1)";
    const result = await pool.query(query, [name.trim()]);
    return result.rows[0];
};
export const updateRole = async (id, name) => {
    const query = `
        UPDATE roles
        SET name = $1
        WHERE id = $2
        RETURNING id, name
    `;
    const result = await pool.query(query, [
        name,
        id
    ]);
    return result.rows[0];
}