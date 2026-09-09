import pool from "../../config/db.js";

export const getAllInventoryItems = async () => {
  const result = await pool.query(`
    SELECT *
    FROM inventory_items
    ORDER BY created_at DESC
  `);
  return result.rows;
};

export const getInventoryItemById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM inventory_items WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const createInventoryItem = async (item) => {
  const {
    name,
    category = "component",
    brand = null,
    reference = null,
    model = null,
    serial_number = null,
    quantity = 0,
    available_quantity = 0,
    condition = "good",
    location = "bodega",
    status = "available",
    notes = null,
  } = item;

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
      name,
      category,
      brand,
      reference,
      model,
      serial_number,
      quantity,
      available_quantity ?? quantity,
      condition,
      location,
      status,
      notes,
    ]
  );

  return result.rows[0];
};

export const updateInventoryItem = async (id, item) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(item).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx += 1;
    }
  });

  if (fields.length === 0) {
    return await getInventoryItemById(id);
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE inventory_items SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );

  return result.rows[0];
};

export const deleteInventoryItem = async (id) => {
  const result = await pool.query(
    "DELETE FROM inventory_items WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export const getAllInventoryLoans = async () => {
  const result = await pool.query(`
    SELECT *
    FROM inventory_loans
    ORDER BY start_datetime DESC
  `);
  return result.rows;
};

export const createInventoryLoan = async (loan) => {
  const {
    item_id,
    quantity,
    requested_by,
    position = null,
    start_datetime = new Date(),
    expected_return_datetime = null,
    pickup_signature = null,
    notes = null,
  } = loan;

  if (!item_id || !requested_by || !quantity) {
    throw new Error("Faltan datos obligatorios para registrar el préstamo.");
  }

  const item = await getInventoryItemById(item_id);

  if (!item) {
    throw new Error("El artículo no existe.");
  }

  const available = Number(item.available_quantity ?? item.quantity ?? 0);
  if (Number(quantity) > available) {
    throw new Error("La cantidad solicitada supera la disponible en inventario.");
  }

  const result = await pool.query(
    `
      INSERT INTO inventory_loans (
        item_id, quantity, requested_by, position,
        start_datetime, expected_return_datetime, pickup_signature, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      item_id,
      quantity,
      requested_by,
      position,
      start_datetime,
      expected_return_datetime,
      pickup_signature,
      notes,
    ]
  );

  await pool.query(
    `UPDATE inventory_items
     SET available_quantity = available_quantity - $1,
         status = CASE WHEN (available_quantity - $1) <= 0 THEN 'loaned' ELSE 'available' END,
         updated_at = NOW()
     WHERE id = $2`,
    [quantity, item_id]
  );

  return result.rows[0];
};

export const updateInventoryLoanReturn = async (loanId, payload = {}) => {
  const {
    actual_return_datetime = new Date(),
    return_signature = null,
    notes = null,
  } = payload;

  const loan = await pool.query(
    "SELECT * FROM inventory_loans WHERE id = $1",
    [loanId]
  );

  if (!loan.rows[0]) {
    throw new Error("El préstamo no existe.");
  }

  const currentLoan = loan.rows[0];

  const result = await pool.query(
    `
      UPDATE inventory_loans
      SET actual_return_datetime = $1,
          return_signature = $2,
          notes = COALESCE($3, notes),
          status = 'returned'
      WHERE id = $4
      RETURNING *
    `,
    [actual_return_datetime, return_signature, notes, loanId]
  );

  await pool.query(
    `UPDATE inventory_items
     SET available_quantity = available_quantity + $1,
         status = 'available',
         updated_at = NOW()
     WHERE id = $2`,
    [currentLoan.quantity, currentLoan.item_id]
  );

  return result.rows[0];
};
