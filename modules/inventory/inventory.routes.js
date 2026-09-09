import { Router } from 'express';
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

router.get('/items', getAllInventoryItemsController);
router.get('/items/:id', getInventoryItemByIdController);
router.post('/items', createInventoryItemController);
router.patch('/items/:id', updateInventoryItemController);
router.delete('/items/:id', deleteInventoryItemController);

router.get('/loans', getAllInventoryLoansController);
router.post('/loans', createInventoryLoanController);
router.patch('/loans/:id/return', updateInventoryLoanReturnController);

export default router;