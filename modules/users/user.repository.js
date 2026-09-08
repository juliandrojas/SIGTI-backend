import pool from "../../config/db.js";
import { hashPassword } from "../../utils/password.js";

const existsUsername = async (username) => {
  const result = await pool.query(
    "SELECT 1 FROM users WHERE username = $1 LIMIT 1",
    [username]
  );
  return result.rowCount > 0;
};

const generateUniqueUsername = async (name, firstLastName, secondLastName) => {
  const baseUsername = `${name.trim().toLowerCase()}.${firstLastName.trim().toLowerCase()}`;
  let username = baseUsername;
  let counter = 1;

  while (await existsUsername(username)) {
    username = `${baseUsername}${counter}`;
    counter += 1;
  }

  return username;
};

export const createUser = async ({ name, firstLastName, secondLastName = "", email, password }) => {
  // Validación de campos obligatorios
  if (!name?.trim() || !firstLastName?.trim() || !email?.trim() || !password?.trim()) {
    throw new Error("Todos los campos obligatorios deben estar presentes.");
  }
  // Generamos el nombre de usuario de forma asíncrona
  const username = await generateUniqueUsername(name, firstLastName, secondLastName);

  // Hasheamos la contraseña
  const hashedPassword = await hashPassword(password);

  // Concatenar apellidos para la columna lastname
  const fullLastName = secondLastName.trim()
    ? `${firstLastName.trim()} ${secondLastName.trim()}`
    : firstLastName.trim();

  // Guardar en la base de datos
  const query = `
    INSERT INTO users (name, lastname, username, email, password, role_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, lastname, username, email, role_id
  `;

  const result = await pool.query(query, [
    name.trim(),
    fullLastName,
    username,
    email.trim().toLowerCase(),
    hashedPassword,
    4
  ]);

  return result.rows[0];
};

export const getUsername = async (username) => {
  const query = `
    SELECT id, name, lastname, username, email, role_id
    FROM users
    WHERE LOWER(username) = LOWER($1)
  `;
  const result = await pool.query(query, [username.trim()]);
    return result.rows[0];
};

export const findUserForLogin = async (username) =>{
    const query = "SELECT id, name, username, email, password, role_id FROM users WHERE LOWER(username) = LOWER($1)";
    const result = await pool.query(query, [username]);
  return result.rows[0];
}

export const saveResetToken = async (email, tokenHash, expiresAt) => {
  const query = `
    UPDATE users
    SET reset_token_hash = $1,
        reset_token_expires_at = $2
    WHERE LOWER(email) = LOWER($3)
    RETURNING id, email
  `;

  const result = await pool.query(query, [
    tokenHash,
    expiresAt,
    email.trim()
  ]);

  return result.rows[0];
};
