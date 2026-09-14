import assert from "node:assert/strict";
import test from "node:test";
import { isSystemsAdministrator } from "./admin.middleware.js";

test("autoriza al rol 1 del área de Sistemas aunque su nombre no sea Administrador", () => {
  assert.equal(isSystemsAdministrator(1, "Sistemas"), true);
});

test("autoriza los nombres administrativos heredados", () => {
  assert.equal(isSystemsAdministrator(9, "Administrador"), true);
});

test("no autoriza a un usuario general", () => {
  assert.equal(isSystemsAdministrator(2, "Usuario"), false);
});
