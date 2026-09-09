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
  if (!name?.trim() || !firstLastName?.trim() || !email?.trim() || !password?.trim()) {
    throw new Error("Todos los campos obligatorios deben estar presentes.");
  }

  const username = await generateUniqueUsername(name, firstLastName, secondLastName);
  const hashedPassword = await hashPassword(password);

  const fullLastName = secondLastName.trim()
    ? `${firstLastName.trim()} ${secondLastName.trim()}`
    : firstLastName.trim();

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
    4,
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

export const findUserForLogin = async (username) => {
  const query = "SELECT id, name, username, email, password, role_id FROM users WHERE LOWER(username) = LOWER($1)";
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const query = `
    SELECT id, name, username, email, password, role_id
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `;

  const result = await pool.query(query, [email.trim()]);
  return result.rows[0];
};

export const saveResetToken = async (email, tokenHash, expiresAt) => {
  const query = `
    UPDATE users
    SET reset_token_hash = $1,
        reset_token_expires_at = $2
    WHERE LOWER(email) = LOWER($3)
    RETURNING id, email, name, username
  `;

  const result = await pool.query(query, [
    tokenHash,
    expiresAt,
    email.trim(),
  ]);

  return result.rows[0];
};

export const findUserByResetToken = async (tokenHash) => {
  const query = `
    SELECT id, name, username, email, password, role_id
    FROM users
    WHERE reset_token_hash = $1
      AND reset_token_expires_at IS NOT NULL
      AND reset_token_expires_at > NOW()
    LIMIT 1
  `;

  const result = await pool.query(query, [tokenHash]);
  return result.rows[0];
};

export const updatePasswordById = async (userId, newPasswordHash) => {
  const query = `
    UPDATE users
    SET password = $1,
        reset_token_hash = NULL,
        reset_token_expires_at = NULL
    WHERE id = $2
    RETURNING id, email, username
  `;

  const result = await pool.query(query, [newPasswordHash, userId]);
  return result.rows[0];
};

export const clearResetTokenById = async (userId) => {
  const query = `
    UPDATE users
    SET reset_token_hash = NULL,
        reset_token_expires_at = NULL
    WHERE id = $1
  `;

  await pool.query(query, [userId]);
};
