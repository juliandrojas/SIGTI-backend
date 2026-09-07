import { Router } from 'express';
import { createUserAdminController, createUserController, getAllUsersController, getUserAdminController, getUserController, updateUserController } from './user.controller.js';
const router = Router();

router.post("/admin", createUserAdminController);
router.post("/user", createUserController);
router.get("/admin", getUserAdminController);
router.get("/user", getUserController);
router.get("/user/all", getAllUsersController);
router.put("/", updateUserController);
export default router;