import {
    createInventoryItem,
    createInventoryLoan,
    deleteInventoryItem,
    getAllInventoryItems,
    getAllInventoryLoans,
    getInventoryItemById,
    updateInventoryItem,
    updateInventoryLoanReturn,
} from "./inventory.repository.js";
import { createRequest, getAllRequests, getMyRequests, deliverRequest, rejectRequest, returnRequest } from "./request.repository.js";

const isValidId = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

export const getAllInventoryItemsService = async () => {
  return await getAllInventoryItems();
};

export const getInventoryItemByIdService = async (id) => {
  if (!isValidId(id)) {
    throw new Error("El ID del artículo no es válido.");
  }

  return await getInventoryItemById(id);
};

export const createInventoryItemService = async (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Los datos del artículo son obligatorios.");
  }

  return await createInventoryItem(payload);
};

export const updateInventoryItemService = async (id, payload) => {
  if (!isValidId(id)) {
    throw new Error("El ID del artículo no es válido.");
  }

  return await updateInventoryItem(id, payload);
};

export const deleteInventoryItemService = async (id) => {
  if (!isValidId(id)) {
    throw new Error("El ID del artículo no es válido.");
  }

  return await deleteInventoryItem(id);
};

export const getAllInventoryLoansService = async () => {
  return await getAllInventoryLoans();
};

export const createInventoryLoanService = async (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Los datos del préstamo son obligatorios.");
  }

  if (!payload.item_id || !payload.requested_by || !payload.quantity) {
    throw new Error("Faltan datos obligatorios para registrar el préstamo.");
  }

  return await createInventoryLoan(payload);
};

export const updateInventoryLoanReturnService = async (loanId, payload) => {
  if (!isValidId(loanId)) {
    throw new Error("El ID del préstamo no es válido.");
  }

  return await updateInventoryLoanReturn(loanId, payload);
};
export const createInventoryRequestService = (payload, userId) => createRequest(payload, userId);
export const getMyInventoryRequestsService = (userId) => getMyRequests(userId);
export const getAllInventoryRequestsService = () => getAllRequests();
export const deliverInventoryRequestService = (id, userId, previousReceived) => deliverRequest(Number(id), userId, previousReceived);
export const rejectInventoryRequestService = (id, userId, reason) => rejectRequest(Number(id), userId, reason);
export const returnInventoryRequestService = (id, userId) => returnRequest(Number(id), userId);
