import { Router } from 'express';
import { createUserController, getUsernameController, loginUserController } from './user.controller.js';
const router = Router();
router.post("/create", createUserController);
router.get("/:username", getUsernameController);
router.post("/login", loginUserController);
export default router;