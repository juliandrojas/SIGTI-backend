import { Router } from 'express';
import { createUserController, findUserForLoginController, getUsernameController } from './user.controller.js';
const router = Router();
router.post("/create", createUserController);
router.get("/:username", getUsernameController);
router.post("/login", findUserForLoginController);
export default router;