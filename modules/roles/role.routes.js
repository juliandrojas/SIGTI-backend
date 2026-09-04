import { Router } from 'express';
import { getAllRolesController } from './role.controller.js';
const router = Router();

router.get("/", getAllRolesController);

export default router;