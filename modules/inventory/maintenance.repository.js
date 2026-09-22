import pool from "../../config/db.js";
import { isMaintenanceRecent, validateMaintenance, validateMaintenanceEdit } from "./maintenance.validation.js";
import { isComputerAssetType } from "./computer.validation.js";

export const createMaintenance = async (payload, technicianId) => {
  const data = validateMaintenance(payload);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const item = await client.query("SELECT id, asset_type FROM inventory_items WHERE id=$1 FOR UPDATE", [data.item_id]);
    if (!item.rows[0]) throw new Error("El equipo seleccionado no existe.");
    if (!isComputerAssetType(item.rows[0].asset_type)) throw new Error("Solo los equipos pueden registrarse en Mantenimiento.");
    const previous = await client.query("SELECT performed_at, next_due_date FROM maintenance_records WHERE item_id=$1 ORDER BY performed_at DESC LIMIT 1", [data.item_id]);
    if (isMaintenanceRecent(previous.rows[0], data.performed_at)) {
      const duplicate = new Error("Al equipo ya se le hizo mantenimiento recientemente.");
      duplicate.statusCode = 409;
      throw duplicate;
    }
    const result = await client.query(`INSERT INTO maintenance_records (item_id, technician_id, performed_at, next_due_date, tasks, notes) VALUES ($1,$2,$3,$4,$5::jsonb,$6) RETURNING *`, [data.item_id, technicianId, data.performed_at, data.next_due_date, JSON.stringify(data.tasks), data.notes]);
  await client.query("UPDATE inventory_items SET updated_at=NOW() WHERE id=$1", [data.item_id]);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
};

export const getMaintenanceRecords = async () => (await pool.query(`SELECT m.*, i.name AS item_name, i.asset_code, i.serial_number, u.name AS technician_name, u.lastname AS technician_lastname FROM maintenance_records m JOIN inventory_items i ON i.id=m.item_id LEFT JOIN users u ON u.id=m.technician_id ORDER BY m.performed_at DESC, m.id DESC`)).rows;

export const updateMaintenance = async (recordId, payload) => {
  const id = Number(recordId);
  if (!Number.isInteger(id) || id <= 0) throw new Error("El identificador del mantenimiento no es válido.");
  const data = validateMaintenanceEdit(payload);
  const result = await pool.query(
    `UPDATE maintenance_records
     SET performed_at=$2, next_due_date=$3, notes=$4
     WHERE id=$1
     RETURNING *`,
    [id, data.performed_at, data.next_due_date, data.notes],
  );
  if (!result.rows[0]) {
    const error = new Error("El mantenimiento no existe.");
    error.statusCode = 404;
    throw error;
  }
  return result.rows[0];
};
