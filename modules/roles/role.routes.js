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
router.get("/:id", getRoleByIdController);
router.get("/:name", getRoleByNameController);
router.patch("/:id", updateRoleController);
export default router;