import { verifyToken } from "../utils/jwt.js";

export const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") || [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Token de autenticación requerido",
    });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};
