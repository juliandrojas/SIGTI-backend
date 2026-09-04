import pool from "../../config/db.js";

export const getAllRoles = async () => {
    const result = await pool.query("SELECT * FROM roles");
    return result.rows;
}