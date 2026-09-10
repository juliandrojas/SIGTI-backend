import { Router } from 'express';
import {
    requireAdminOrSystems,
    requireExternalOrAdmin,
} from '../../middleware/role.middleware.js';
import {
    createInventoryItemController,
    createInventoryLoanController,
    deleteInventoryItemController,
    getAllInventoryItemsController,
    getAllInventoryLoansController,
    getInventoryItemByIdController,
    updateInventoryItemController,
    updateInventoryLoanReturnController,
} from './inventory.controller.js';

const router = Router();

// Artículos de inventario
router.get('/items', getAllInventoryItemsController);
router.get('/items/:id', getInventoryItemByIdController);
router.post('/items', requireAdminOrSystems, createInventoryItemController);
router.patch('/items/:id', requireAdminOrSystems, updateInventoryItemController);
router.delete('/items/:id', requireAdminOrSystems, deleteInventoryItemController);

// Préstamos
// Historial: Solo Administrador (1) y Usuario Área Sistemas (2)
router.get('/loans', requireAdminOrSystems, getAllInventoryLoansController);
router.patch('/loans/:id/return', requireAdminOrSystems, updateInventoryLoanReturnController);

// Solicitud/Registro de préstamo: Usuario Externo (3) y Administrador
router.post('/loans', requireExternalOrAdmin, createInventoryLoanController);

export default router;