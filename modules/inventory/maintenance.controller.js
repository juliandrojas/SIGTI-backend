import { createMaintenance, getMaintenanceRecords } from "./maintenance.repository.js";

export const createMaintenanceController = async (req, res) => {
  try { return res.status(201).json(await createMaintenance(req.body, Number(req.user.sub))); }
  catch (error) { return res.status(400).json({ message: error.message }); }
};

export const getMaintenanceController = async (_req, res) => {
  try { return res.status(200).json(await getMaintenanceRecords()); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};
