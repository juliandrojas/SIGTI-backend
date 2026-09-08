import cors from "cors";
import dotenv from 'dotenv';
import express from 'express';
import { authenticateToken } from "./middleware/auth.middleware.js";
import indexRoutes from './modules/index/index.routes.js';
import roleRoutes from "./modules/roles/role.routes.js";
import userRoutes from "./modules/users/user.routes.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
// Routes
app.use("/",indexRoutes);
app.use("/roles", authenticateToken, roleRoutes);
app.use("/users", userRoutes);
app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
});
// Middleware centralizado de errores (al final de api/index.js)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});