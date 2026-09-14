const toDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  if (!value || Number.isNaN(date.getTime())) throw new Error("La fecha de mantenimiento no es válida.");
  return date;
};

export const addMaintenancePeriod = (value) => {
  const date = toDate(value);
  const originalDay = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + 6);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(originalDay, lastDay));
  return date.toISOString().slice(0, 10);
};

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
