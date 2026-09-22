const toDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("La fecha de mantenimiento debe tener el formato AAAA-MM-DD.");
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("La fecha de mantenimiento no es válida.");
  }
  return date;
};

export const addMaintenancePeriod = (value) => {
  const date = toDate(value);
  const originalDay = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 6);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(originalDay, lastDay));
  return date.toISOString().slice(0, 10);
};

export const isMaintenanceRecent = (record, referenceDate) => Boolean(record?.next_due_date && String(record.next_due_date).slice(0, 10) >= referenceDate);

export const validateMaintenance = (payload = {}) => {
  const itemId = Number(payload.item_id);
  if (!Number.isInteger(itemId) || itemId <= 0) throw new Error("Debes seleccionar un equipo.");
  const performedAt = payload.performed_at || new Date().toISOString().slice(0, 10);
  const tasks = Array.isArray(payload.tasks) ? payload.tasks.filter(Boolean) : [];
  if (!tasks.includes("Limpieza interna") || !tasks.includes("Cambio de pasta térmica")) {
    throw new Error("La limpieza interna y el cambio de pasta térmica son obligatorios.");
  }
  return { item_id: itemId, performed_at: performedAt, next_due_date: addMaintenancePeriod(performedAt), tasks, notes: String(payload.notes || "").trim() || null };
};

export const validateMaintenanceEdit = (payload = {}) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Los datos del mantenimiento no son válidos.");
  }
  const performedAt = payload.performed_at;
  const nextDueDate = addMaintenancePeriod(performedAt);
  if (payload.notes != null && typeof payload.notes !== "string") {
    throw new Error("Las observaciones deben ser texto.");
  }
  return {
    performed_at: performedAt,
    next_due_date: nextDueDate,
    notes: payload.notes?.trim() || null,
  };
};
