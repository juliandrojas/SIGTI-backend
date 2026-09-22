import assert from "node:assert/strict";
import test from "node:test";
import { OS_OPTIONS, validateComputerAsset } from "./computer.validation.js";

const validComputer = {
  asset_code: "EF0001", ip_address: "172.16.1.10", area: "Sistemas", assigned_user: "Jhon Henry Barbosa Gonzalez",
  brand: "Dell", model: "Latitude", serial_number: "SER-001", asset_type: "laptop", processor: "i5",
  ram: "16 GB", operating_system: "WIN 11 Pro", hdd: "", ssd: "500 GB", nvme: false, screen_size: "14 pulgadas", antivirus: "Sophos",
};

test("acepta un computador con SSD como almacenamiento mínimo", () => {
  assert.equal(validateComputerAsset(validComputer).asset_code, "EF0001");
});

test("rechaza un computador sin HDD ni SSD", () => {
  assert.throws(() => validateComputerAsset({ ...validComputer, ssd: "", hdd: "" }), /almacenamiento/);
});

test("rechaza un tipo de activo fuera del catálogo", () => {
  assert.throws(() => validateComputerAsset({ ...validComputer, asset_type: "server" }), /tipo de activo/);
});

test("incluye los sistemas operativos usados por la planilla", () => {
  assert.deepEqual(OS_OPTIONS, ["WIN 10 Pro", "WIN 10 Single Lenguaje", "WIN 11 Pro", "WIN 7 Pro", "WIN 8.1 Single Lenguaje", "MacOS", "WIN 11 Single Lenguaje", "WIN 11 Pro For Workstations"]);
});
