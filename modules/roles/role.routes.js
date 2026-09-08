import { Router } from 'express';
import {
    createRoleController,
    getAllRolesController,
    getRoleByIdController,
    getRoleByNameController,
    updateRoleController
} from './role.controller.js';
const router = Router();

router.post("/", createRoleController);
router.get("/", getAllRolesController);
router.get("/name/:name", getRoleByNameController);
router.get("/:id", getRoleByIdController);
router.patch("/:id", updateRoleController);
export default router;