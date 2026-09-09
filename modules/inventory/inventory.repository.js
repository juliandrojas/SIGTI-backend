import pool from "../../config/db.js";

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

  if (payload.category !== undefined && payload.category !== null) {
    payload.category = String(payload.category).trim();
  }

  if (payload.location !== undefined && payload.location !== null) {
    payload.location = String(payload.location).trim();
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

  if (payload.status !== undefined && payload.status !== null) {
    const allowedStatuses = ["available", "loaned", "maintenance"];
    if (!allowedStatuses.includes(payload.status)) {
      throw new Error("El estado del artículo no es válido.");
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
  const safeItem = validateInventoryItemPayload(item);

  const quantity = Number(safeItem.quantity ?? 0);
  const availableQuantity = Number(safeItem.available_quantity ?? quantity);

  if (availableQuantity > quantity) {
    throw new Error("La cantidad disponible no puede superar la cantidad total.");
  }

  const result = await pool.query(
    `
      INSERT INTO inventory_items (
        name, category, brand, reference, model, serial_number,
        quantity, available_quantity, condition, location, status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `,
    [
      safeItem.name,
      safeItem.category ?? "component",
      safeItem.brand ?? null,
      safeItem.reference ?? null,
      safeItem.model ?? null,
      safeItem.serial_number ?? null,
      quantity,
      availableQuantity,
      safeItem.condition ?? "good",
      safeItem.location ?? "bodega",
      safeItem.status ?? "available",
      safeItem.notes ?? null,
    ]
  );

  return result.rows[0];
};

export const updateInventoryItem = async (id, item) => {
  const parsedId = normalizePositiveInteger(id, "id");
  const safeItem = validateInventoryItemPayload(item, true);

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
    SELECT l.*, i.name AS item_name, i.brand AS item_brand, i.location AS item_location
    FROM inventory_loans l
    INNER JOIN inventory_items i ON i.id = l.item_id
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

  if (item.status === "maintenance") {
    throw new Error("No se puede prestar un artículo en mantenimiento.");
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
          start_datetime, expected_return_datetime, pickup_signature, notes, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
        RETURNING *
      `,
      [
        itemId,
        quantity,
        String(payload.requested_by).trim(),
        payload.position ?? null,
        payload.start_datetime ?? new Date(),
        payload.expected_return_datetime ?? null,
        payload.pickup_signature ?? null,
        payload.notes ?? null,
      ]
    );

    const updated = await client.query(
      `UPDATE inventory_items
       SET available_quantity = available_quantity - $1,
           status = CASE WHEN (available_quantity - $1) <= 0 THEN 'loaned' ELSE 'available' END,
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
           status = CASE WHEN (available_quantity + $1) > 0 THEN 'available' ELSE 'loaned' END,
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
