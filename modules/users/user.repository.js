import { hashPassword } from "../../utils/password.js";

export const createUserAdmin = async (name, email, password) => {
    const hashedPassword = await hashPassword(password);
    const query = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role
    `;
    const result = await pool.query(query, [
        name,
        email,
        hashedPassword,
        1
    ]);
    return result.rows[0];
};
export const createUser = async (name, email, password) => {
    const hashedPassword = await hashPassword(password);
    const query = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role
    `;
    const result = await pool.query(query, [
        name,
        email,
        hashedPassword,
        4
    ]);
    return result.rows[0];
}
export const getAllUsers = async () => {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
}
export const getUserAdmin = async (email) => {
    const query = `
        SELECT * 
        FROM users 
        WHERE LOWER(email) = LOWER($1)
        AND role = 1
    `;
    const result = await pool.query(query,[email.trim()]);
    return result.rows[0];
}
export const getUser = async (email) => {
    const query = `
        SELECT * 
        FROM users 
        WHERE LOWER(email) = LOWER($1)
        AND role = 4
    `;
    const result = await pool.query(query,[email.trim()]);
    return result.rows[0];
};
export const updateUser = async (id, name, email, role) => {
    const query = `
        UPDATE users
        SET name = $1,
            email = $2,
            role = $3
        WHERE id = $4
        RETURNING id, name, email, role
    `;

    const result = await pool.query(query, [
        name,
        email,
        role,
        id
    ]);

    return result.rows[0];
};
export const updateUserPassword = async (id, password) => {
    const hashedPassword = await hashPassword(password);

    const query = `
        UPDATE users
        SET password = $1
        WHERE id = $2
        RETURNING id, name, email, role
    `;

    const result = await pool.query(query, [
        hashedPassword,
        id
    ]);

    return result.rows[0];
};