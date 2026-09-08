import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Falta JWT_SECRET en las variables de entorno");
  }

  return secret;
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      roleId: user.role_id,
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};
