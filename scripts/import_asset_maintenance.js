import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";
import pool from "../config/db.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(scriptDir, "../../Inventario de Activos - PPAL MANTENIMIENTO.csv");
const workbook = xlsx.readFile(sourcePath, { raw: false });
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "", raw: false });
const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const text = (value) => String(value ?? "").trim();
const dateFromFile = (value) => {
  const raw = text(value);
  if (!raw) return null;
  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) throw new Error(`Fecha no válida en el archivo: ${raw}`);
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
};
const ipFromFile = (value) => {
  const raw = text(value);
  return raw && raw.toUpperCase() !== "SIN IP" ? raw : null;
};
const assetTypeFromSource = (value) => {
  const normalized = normalize(value);
  if (normalized.startsWith("port")) return "laptop";
  if (normalized === "aio" || normalized.includes("all in one")) return "all_in_one";
  if (normalized.startsWith("torre")) return "tower";
  throw new Error(`Tipo de equipo no reconocido en el archivo: ${text(value)}`);
};
const addSixMonths = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + 6);
  return date.toISOString().slice(0, 10);
};

const importRows = rows
  .filter((row) => text(row["Codigo Equipo"]).toUpperCase().startsWith("EF"))
  .filter((row) => !(text(row["Codigo Equipo"]).toUpperCase() === "EF0658" && ipFromFile(row.IP) !== "172.16.1.155"));

const today = new Date().toISOString().slice(0, 10);
const client = await pool.connect();
const result = { inserted: 0, updated: 0, maintenanceInserted: 0, maintenanceUpdated: 0, skipped: 0, unmatchedUsers: [] };

try {
  await client.query("BEGIN");

  const technicianResult = await client.query("SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1", ["julian.rojas"]);
  if (!technicianResult.rows[0]) throw new Error("No se encontró el usuario técnico julian.rojas.");
  const technicianId = technicianResult.rows[0].id;
  const usersResult = await client.query("SELECT id, name, lastname FROM users");
  const userMap = new Map(usersResult.rows.map((user) => [normalize(`${user.name} ${user.lastname}`), user]));

  for (const row of importRows) {
    const assetCode = text(row["Codigo Equipo"]).toUpperCase();
    const assetType = assetTypeFromSource(row["Tipo de Equipo"]);
    const ipAddress = ipFromFile(row.IP);
    const assignedUser = text(row.Usuario);
    const canonicalUser = userMap.get(normalize(assignedUser));
    if (!canonicalUser && assignedUser) result.unmatchedUsers.push({ assetCode, assignedUser });

    const performedAt = dateFromFile(row["Ult Mantenimiento"]) ?? today;
    const nextDueDate = addSixMonths(performedAt);
    const values = [
      `${text(row["Marca equipo"])} ${text(row["Modelo equipo"])}`.trim(), assetType,
      text(row["Marca equipo"]) || null, text(row["Modelo equipo"]) || null,
      text(row["Serial equipo"]) || null, 1, 1, "good", text(row.Observaciones) || null,
      assetCode, ipAddress, text(row.Area) || null,
      canonicalUser ? `${canonicalUser.name} ${canonicalUser.lastname}` : assignedUser || null,
      text(row.Procesador) || null, text(row.RAM) || null,
      text(row.SO) || null, text(row.HDD) || null, text(row.SSD) || null,
      Boolean(text(row.NVME)), text(row["Tallaño Pantalla"]) || null, text(row.Antivirus) || null,
    ];

    const existing = await client.query("SELECT id FROM inventory_items WHERE asset_code = $1 LIMIT 1", [assetCode]);
    let itemId;
    if (existing.rows[0]) {
      const updated = await client.query(`UPDATE inventory_items SET
        name=$1, asset_type=$2, brand=$3, model=$4, serial_number=$5,
        quantity=$6, available_quantity=$7, condition=$8, notes=$9, asset_code=$10,
        ip_address=$11, area=$12, assigned_user=$13, processor=$14, ram=$15,
        operating_system=$16, hdd=$17, ssd=$18, nvme=$19, screen_size=$20,
        antivirus=$21, updated_at=NOW() WHERE id=$22 RETURNING id`, [...values, existing.rows[0].id]);
      itemId = updated.rows[0].id;
      result.updated += 1;
    } else {
      const inserted = await client.query(`INSERT INTO inventory_items (
        name, asset_type, brand, model, serial_number, quantity, available_quantity,
        condition, notes, asset_code, ip_address, area, assigned_user, processor, ram,
        operating_system, hdd, ssd, nvme, screen_size,
        antivirus
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING id`, values);
      itemId = inserted.rows[0].id;
      result.inserted += 1;
    }

    const maintenance = await client.query("SELECT id FROM maintenance_records WHERE item_id=$1 AND performed_at=$2 LIMIT 1", [itemId, performedAt]);
    const tasks = JSON.stringify(["Mantenimiento migrado desde Inventario de Activos"]);
    const notes = text(row.Observaciones) || "Mantenimiento migrado desde Inventario de Activos.";
    if (maintenance.rows[0]) {
      await client.query("UPDATE maintenance_records SET technician_id=$1, next_due_date=$2, tasks=$3::jsonb, notes=$4 WHERE id=$5", [technicianId, nextDueDate, tasks, notes, maintenance.rows[0].id]);
      result.maintenanceUpdated += 1;
    } else {
      await client.query("INSERT INTO maintenance_records (item_id, technician_id, performed_at, next_due_date, tasks, notes) VALUES ($1,$2,$3,$4,$5::jsonb,$6)", [itemId, technicianId, performedAt, nextDueDate, tasks, notes]);
      result.maintenanceInserted += 1;
    }
  }

  await client.query("COMMIT");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
