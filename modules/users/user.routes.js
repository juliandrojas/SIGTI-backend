import { Router } from 'express';
import {
    createUserController,
    findUserForLoginController,
    getUsernameController,
    requestPasswordResetController,
    resetPasswordController,
} from './user.controller.js';
const router = Router();
router.post("/create", createUserController);
router.post("/login", findUserForLoginController);
router.post("/forgot-password", requestPasswordResetController);
router.post("/reset-password", resetPasswordController);
router.get("/:username", getUsernameController);
export default router;