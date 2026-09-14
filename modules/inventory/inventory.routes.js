import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { requireRequesterOrAdmin } from '../../middleware/role.middleware.js';
import {
    createInventoryItemController,
    createInventoryLoanController,
    deleteInventoryItemController,
    getAllInventoryItemsController,
    getAllInventoryLoansController,
    getInventoryItemByIdController,
    updateInventoryItemController,
    updateInventoryLoanReturnController,
    createInventoryRequestController, getMyInventoryRequestsController, getAllInventoryRequestsController, deliverInventoryRequestController, rejectInventoryRequestController, returnInventoryRequestController,
} from './inventory.controller.js';
import { createMaintenanceController, getMaintenanceController } from './maintenance.controller.js';

const router = Router();

// Artículos de inventario
router.get('/items', getAllInventoryItemsController);
router.get('/items/:id', getInventoryItemByIdController);
router.post('/items', requireAdmin, createInventoryItemController);
router.patch('/items/:id', requireAdmin, updateInventoryItemController);
router.delete('/items/:id', requireAdmin, deleteInventoryItemController);

// Préstamos
// Historial y devoluciones: solo área de Sistemas (rol 1).
router.get('/loans', requireAdmin, getAllInventoryLoansController);
router.patch('/loans/:id/return', requireAdmin, updateInventoryLoanReturnController);

// Solicitud de préstamo: Usuario general (2) y Administrador para soporte.
router.post('/loans', requireRequesterOrAdmin, createInventoryLoanController);
router.post('/requests', requireRequesterOrAdmin, createInventoryRequestController);
router.get('/requests/mine', requireRequesterOrAdmin, getMyInventoryRequestsController);
router.get('/requests', requireAdmin, getAllInventoryRequestsController);
router.patch('/requests/:id/deliver', requireAdmin, deliverInventoryRequestController);
router.patch('/requests/:id/reject', requireAdmin, rejectInventoryRequestController);
router.patch('/requests/:id/return', requireAdmin, returnInventoryRequestController);
router.get('/maintenance', requireAdmin, getMaintenanceController);
router.post('/maintenance', requireAdmin, createMaintenanceController);

export default router;
