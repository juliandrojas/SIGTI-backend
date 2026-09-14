import {
    createInventoryItemService,
    createInventoryLoanService,
    deleteInventoryItemService,
    getAllInventoryItemsService,
    getAllInventoryLoansService,
    getInventoryItemByIdService,
    updateInventoryItemService,
    updateInventoryLoanReturnService,
} from "./inventory.service.js";
import { createInventoryRequestService, getMyInventoryRequestsService, getAllInventoryRequestsService, deliverInventoryRequestService, rejectInventoryRequestService, returnInventoryRequestService } from "./inventory.service.js";

export const getAllInventoryItemsController = async (req, res) => {
  try {
    const items = await getAllInventoryItemsService();
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInventoryItemByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getInventoryItemByIdService(id);

    if (!item) {
      return res.status(404).json({ message: "Artículo no encontrado." });
    }

    return res.status(200).json(item);
  } catch (error) {
    const status = error.message.includes("no es válido") ? 400 : 500;
    return res.status(status).json({ message: error.message });
  }
};

export const createInventoryItemController = async (req, res) => {
  try {
    const item = await createInventoryItemService(req.body);
    return res.status(201).json(item);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateInventoryItemController = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await updateInventoryItemService(id, req.body);
    return res.status(200).json(item);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteInventoryItemController = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await deleteInventoryItemService(id);
    return res.status(200).json({ message: "Artículo eliminado correctamente.", item });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllInventoryLoansController = async (req, res) => {
  try {
    const loans = await getAllInventoryLoansService();
    return res.status(200).json(loans);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createInventoryLoanController = async (req, res) => {
  try {
    const loan = await createInventoryLoanService(req.body);
    return res.status(201).json(loan);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateInventoryLoanReturnController = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await updateInventoryLoanReturnService(id, req.body);
    return res.status(200).json(loan);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
const requestAction = (action) => async (req,res) => { try { return res.status(200).json(await action(req)); } catch(error) { return res.status(400).json({message:error.message}); } };
export const createInventoryRequestController = async (req,res) => { try { return res.status(201).json(await createInventoryRequestService(req.body, Number(req.user.sub))); } catch(error) { return res.status(400).json({message:error.message}); } };
export const getMyInventoryRequestsController = async (req,res) => res.json(await getMyInventoryRequestsService(Number(req.user.sub)));
export const getAllInventoryRequestsController = async (_req,res) => res.json(await getAllInventoryRequestsService());
export const deliverInventoryRequestController = requestAction((req)=>deliverInventoryRequestService(req.params.id,Number(req.user.sub),Boolean(req.body?.previous_component_received)));
export const rejectInventoryRequestController = requestAction((req)=>rejectInventoryRequestService(req.params.id,Number(req.user.sub),req.body?.reason));
export const returnInventoryRequestController = requestAction((req)=>returnInventoryRequestService(req.params.id,Number(req.user.sub)));
