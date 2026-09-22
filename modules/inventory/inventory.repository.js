import pool from "../../config/db.js";
import { isComputerAssetType, validateComputerAsset } from "./computer.validation.js";

const normalizePositiveInteger = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${fieldName} debe ser un número entero válido y no negativo.`);
  }

  return parsed;
};

const validateInventoryItemPayload = (item, isUpdate = false) => {
  const payload = { ...item };

  if (!isUpdate && (!payload.name || String(payload.name).trim() === "")) {
    throw new Error("El nombre del artículo es obligatorio.");
  }

  if (payload.name !== undefined && payload.name !== null) {
    payload.name = String(payload.name).trim();
    if (payload.name === "") {
      throw new Error("El nombre del artículo no puede quedar vacío.");
    }
  }

  if (payload.asset_type !== undefined && payload.asset_type !== null) {
    const allowedAssetTypes = ["laptop", "all_in_one", "tower", "peripheral"];
    if (!allowedAssetTypes.includes(payload.asset_type)) {
      throw new Error("El tipo de activo no es válido.");
    }
  }

  if (payload.quantity !== undefined) {
    payload.quantity = normalizePositiveInteger(payload.quantity, "quantity");
  }

  if (payload.available_quantity !== undefined) {
    payload.available_quantity = normalizePositiveInteger(payload.available_quantity, "available_quantity");
  }

  if (
    payload.quantity !== undefined &&
    payload.available_quantity !== undefined &&
    payload.available_quantity > payload.quantity
  ) {
    throw new Error("La cantidad disponible no puede superar la cantidad total.");
  }

  if (payload.condition !== undefined && payload.condition !== null) {
    const allowedConditions = ["good", "warning", "damaged"];
    if (!allowedConditions.includes(payload.condition)) {
      throw new Error("La condición del artículo no es válida.");
    }
  }

  return payload;
};

export const getAllInventoryItems = async () => {
  const result = await pool.query(`
    SELECT *
    FROM inventory_items
    ORDER BY created_at DESC
  `);
  return result.rows;
};

export const getInventoryItemById = async (id) => {
  const parsedId = normalizePositiveInteger(id, "id");
  const result = await pool.query(
    "SELECT * FROM inventory_items WHERE id = $1",
    [parsedId]
  );
  return result.rows[0];
};

export const createInventoryItem = async (item) => {
  const safeItem = isComputerAssetType(item?.asset_type)
    ? validateComputerAsset(item)
    : validateInventoryItemPayload({ ...item, asset_type: item?.asset_type ?? "peripheral" });

  const quantity = Number(safeItem.quantity ?? 0);
  const availableQuantity = Number(safeItem.available_quantity ?? quantity);

  if (availableQuantity > quantity) {
    throw new Error("La cantidad disponible no puede superar la cantidad total.");
  }

  const result = await pool.query(
    `
      INSERT INTO inventory_items (
        name, asset_type, brand, reference, model, serial_number,
        quantity, available_quantity, condition, notes,
        asset_code, ip_address, area, assigned_user, processor, ram,
        operating_system, hdd, ssd, nvme, screen_size, antivirus
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `,
    [
      safeItem.name,
      safeItem.asset_type,
      safeItem.brand ?? null,
      safeItem.reference ?? null,
      safeItem.model ?? null,
      safeItem.serial_number ?? null,
      quantity,
      availableQuantity,
      safeItem.condition ?? "good",
      safeItem.notes ?? null,
      safeItem.asset_code ?? null, safeItem.ip_address ?? null, safeItem.area ?? null, safeItem.assigned_user ?? null,
      safeItem.processor ?? null, safeItem.ram ?? null, safeItem.operating_system ?? null,
      safeItem.hdd ?? null, safeItem.ssd ?? null, Boolean(safeItem.nvme), safeItem.screen_size ?? null, safeItem.antivirus ?? null,
    ]
  );

  return result.rows[0];
};

export const updateInventoryItem = async (id, item) => {
  const parsedId = normalizePositiveInteger(id, "id");
  const safeItem = validateInventoryItemPayload(item, true);

  // Estos campos son administrados por el sistema y nunca deben formar parte
  // de la lista dinámica de columnas actualizadas.
  delete safeItem.id;
  delete safeItem.created_at;
  delete safeItem.updated_at;
  delete safeItem.category;
  delete safeItem.equipment_type;

  if (Object.keys(safeItem).length === 0) {
    return await getInventoryItemById(parsedId);
  }

  const currentItem = await getInventoryItemById(parsedId);
  if (!currentItem) {
    throw new Error("El artículo no existe.");
  }

  if (
    safeItem.quantity !== undefined &&
    safeItem.available_quantity === undefined &&
    safeItem.quantity < currentItem.available_quantity
  ) {
    throw new Error("No puedes reducir la cantidad total por debajo de la cantidad disponible en préstamo.");
  }

  if (
    safeItem.quantity !== undefined &&
    safeItem.available_quantity !== undefined &&
    safeItem.available_quantity > safeItem.quantity
  ) {
    throw new Error("La cantidad disponible no puede superar la cantidad total.");
  }

  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(safeItem).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx += 1;
    }
  });

  values.push(parsedId);

  const result = await pool.query(
    `UPDATE inventory_items
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${idx}
     RETURNING *`,
    values
  );

  return result.rows[0];
};

export const deleteInventoryItem = async (id) => {
  const parsedId = normalizePositiveInteger(id, "id");
  const item = await getInventoryItemById(parsedId);

  if (!item) {
    throw new Error("El artículo no existe.");
  }

  const activeLoans = await pool.query(
    "SELECT COUNT(*) AS total FROM inventory_loans WHERE item_id = $1 AND status = 'active'",
    [parsedId]
  );

  if (Number(activeLoans.rows[0].total) > 0) {
    throw new Error("No puedes eliminar un artículo que tiene préstamos activos.");
  }

  const result = await pool.query(
    "DELETE FROM inventory_items WHERE id = $1 RETURNING *",
    [parsedId]
  );
  return result.rows[0];
};

export const getAllInventoryLoans = async () => {
  const result = await pool.query(`
    SELECT l.*, i.name AS item_name, i.brand AS item_brand
    FROM inventory_loans l
    INNER JOIN inventory_items i ON i.id = l.item_id AND i.asset_type = 'peripheral'
    ORDER BY l.start_datetime DESC
  `);
  return result.rows;
};

export const createInventoryLoan = async (loan) => {
  const payload = { ...loan };
  const itemId = Number(payload.item_id);
  const quantity = normalizePositiveInteger(payload.quantity, "quantity");

  if (!payload.item_id || !payload.requested_by || !payload.quantity) {
    throw new Error("Faltan datos obligatorios para registrar el préstamo.");
  }

  if (String(payload.requested_by).trim() === "") {
    throw new Error("El solicitante es obligatorio.");
  }

  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("El artículo seleccionado no es válido.");
  }

  const item = await getInventoryItemById(itemId);

  if (!item) {
    throw new Error("El artículo no existe.");
  }

  if (item.asset_type !== "peripheral") {
    throw new Error("Los equipos se gestionan exclusivamente desde Mantenimiento.");
  }

  const available = Number(item.available_quantity ?? item.quantity ?? 0);
  if (quantity > available) {
    throw new Error("La cantidad solicitada supera la disponible en inventario.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        INSERT INTO inventory_loans (
          item_id, quantity, requested_by, position,
          start_datetime, expected_return_datetime, notes, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        RETURNING *
      `,
      [
        itemId,
        quantity,
        String(payload.requested_by).trim(),
        payload.position?.trim() ? payload.position.trim() : "Usuario Externo",
        payload.start_datetime ?? new Date(),
        payload.expected_return_datetime ?? null,
        payload.notes ?? null,
      ]
    );

    const updated = await client.query(
      `UPDATE inventory_items
       SET available_quantity = available_quantity - $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [quantity, itemId]
    );

    if (!updated.rows[0]) {
      throw new Error("No se pudo actualizar el inventario tras registrar el préstamo.");
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateInventoryLoanReturn = async (loanId, payload = {}) => {
  const parsedLoanId = normalizePositiveInteger(loanId, "id");
  const {
    actual_return_datetime = new Date(),
    return_signature = null,
    notes = null,
  } = payload;

  const loan = await pool.query(
    "SELECT * FROM inventory_loans WHERE id = $1",
    [parsedLoanId]
  );

  if (!loan.rows[0]) {
    throw new Error("El préstamo no existe.");
  }

  const currentLoan = loan.rows[0];

  if (currentLoan.status === "returned") {
    throw new Error("Este préstamo ya fue devuelto y no puede registrarse otra vez.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        UPDATE inventory_loans
        SET actual_return_datetime = $1,
            return_signature = $2,
            notes = COALESCE($3, notes),
            status = 'returned'
        WHERE id = $4
        RETURNING *
      `,
      [actual_return_datetime, return_signature, notes, parsedLoanId]
    );

    const updatedItem = await client.query(
      `UPDATE inventory_items
       SET available_quantity = available_quantity + $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [currentLoan.quantity, currentLoan.item_id]
    );

    if (!updatedItem.rows[0]) {
      throw new Error("No se pudo devolver el artículo al inventario.");
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
