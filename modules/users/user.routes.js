import { Router } from 'express';
import {
    createUserController,
    findUserForLoginController,
    getUsernameController,
} from './user.controller.js';
const router = Router();
router.post("/create", createUserController);
router.post("/login", findUserForLoginController);
router.get("/:username", getUsernameController);
export default router;
