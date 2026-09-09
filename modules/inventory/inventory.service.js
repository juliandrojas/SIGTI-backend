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

export const getAllInventoryItemsService = async () => {
  return await getAllInventoryItems();
};

export const getInventoryItemByIdService = async (id) => {
  return await getInventoryItemById(id);
};

export const createInventoryItemService = async (payload) => {
  if (!payload?.name || !payload.name.trim()) {
    throw new Error("El nombre del artículo es obligatorio.");
  }

  const item = await createInventoryItem({
    ...payload,
    name: payload.name.trim(),
  });

  return item;
};

export const updateInventoryItemService = async (id, payload) => {
  return await updateInventoryItem(id, payload);
};

export const deleteInventoryItemService = async (id) => {
  return await deleteInventoryItem(id);
};

export const getAllInventoryLoansService = async () => {
  return await getAllInventoryLoans();
};

export const createInventoryLoanService = async (payload) => {
  return await createInventoryLoan(payload);
};

export const updateInventoryLoanReturnService = async (loanId, payload) => {
  return await updateInventoryLoanReturn(loanId, payload);
};
