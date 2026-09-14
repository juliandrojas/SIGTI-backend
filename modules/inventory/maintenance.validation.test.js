import assert from "node:assert/strict";
import test from "node:test";
import { addMaintenancePeriod, isMaintenanceRecent, validateMaintenance } from "./maintenance.validation.js";

test("programa el mantenimiento seis meses después", () => {
  assert.equal(addMaintenancePeriod("2026-01-15"), "2026-07-15");
});

test("ajusta al último día cuando el mes no tiene el día original", () => {
  assert.equal(addMaintenancePeriod("2026-08-31"), "2027-02-28");
});

test("exige las dos tareas preventivas", () => {
  assert.throws(() => validateMaintenance({ item_id: 1, performed_at: "2026-01-15", tasks: ["Limpieza interna"] }), /obligatorios/);
});

test("identifica un mantenimiento vigente", () => {
  assert.equal(isMaintenanceRecent({ performed_at: "2026-09-14", next_due_date: "2027-03-14" }, "2026-09-14"), true);
});
