import assert from "node:assert/strict";
import test from "node:test";
import { validateComputerAsset } from "./computer.validation.js";

const validComputer = {
  asset_code: "EF0001", ip_address: "172.16.1.10", area: "Sistemas", assigned_user: "Jhon Henry Barbosa Gonzalez",
  brand: "Dell", model: "Latitude", serial_number: "SER-001", equipment_type: "Portátil", processor: "i5",
  ram: "16 GB", operating_system: "Windows 11", hdd: "", ssd: "500 GB", nvme: false, screen_size: "14 pulgadas", antivirus: "Sophos",
};

test("acepta un computador con SSD como almacenamiento mínimo", () => {
  assert.equal(validateComputerAsset(validComputer).asset_code, "EF0001");
});

test("rechaza un computador sin HDD ni SSD", () => {
  assert.throws(() => validateComputerAsset({ ...validComputer, ssd: "", hdd: "" }), /almacenamiento/);
});

test("rechaza un tipo de equipo fuera del catálogo", () => {
  assert.throws(() => validateComputerAsset({ ...validComputer, equipment_type: "Servidor" }), /tipo de equipo/);
});
