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
