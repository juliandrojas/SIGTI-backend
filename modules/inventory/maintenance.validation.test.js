import assert from "node:assert/strict";
import test from "node:test";
import { addMaintenancePeriod, isMaintenanceRecent, validateMaintenance, validateMaintenanceEdit } from "./maintenance.validation.js";

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

test("al editar recalcula la próxima fecha y conserva las observaciones", () => {
  assert.deepEqual(validateMaintenanceEdit({ performed_at: "2026-09-22", notes: " Cambio de RAM " }), {
    performed_at: "2026-09-22",
    next_due_date: "2027-03-22",
    notes: "Cambio de RAM",
  });
});

test("al editar permite actualizar o dejar sin definir la IP del equipo", () => {
  assert.equal(validateMaintenanceEdit({ performed_at: "2026-09-22", ip_address: " 172.16.1.10 " }).ip_address, "172.16.1.10");
  assert.equal(validateMaintenanceEdit({ performed_at: "2026-09-22", ip_address: " " }).ip_address, null);
  assert.throws(() => validateMaintenanceEdit({ performed_at: "2026-09-22", ip_address: 123 }), /dirección IP/);
  assert.throws(() => validateMaintenanceEdit({ performed_at: "2026-09-22", ip_address: "999.1.1.1" }), /dirección IP/);
});

test("rechaza fechas imposibles o sin formato ISO al editar", () => {
  assert.throws(() => validateMaintenanceEdit({ performed_at: "2026-02-30" }), /fecha/);
  assert.throws(() => validateMaintenanceEdit({ performed_at: "22-09-2026" }), /AAAA-MM-DD/);
});
