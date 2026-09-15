import assert from "node:assert/strict";
import test from "node:test";
import { validateInventoryRequest } from "./request.validation.js";

const baseRequest = {
  item_id: 4,
  quantity: 1,
  request_type: "temporary_loan",
  expected_return_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  position: "Compras",
};

test("accepts a temporary loan with an expected return date", () => {
  assert.deepEqual(validateInventoryRequest(baseRequest), baseRequest);
});

test("requires an expected return date for a temporary loan", () => {
  assert.throws(
    () => validateInventoryRequest({ ...baseRequest, expected_return_datetime: "" }),
    /fecha esperada de devolución/i
  );
});

test("accepts a permanent replacement without an expected return date", () => {
  const request = { ...baseRequest, request_type: "permanent_replacement", expected_return_datetime: "" };
  assert.deepEqual(validateInventoryRequest(request), request);
});

test("rejects a return date in the past", () => {
  assert.throws(
    () => validateInventoryRequest({ ...baseRequest, expected_return_datetime: "2020-01-01T12:00:00.000Z" }),
    /posterior a la fecha y hora actuales/i
  );
});

test("requires exactly one unit for a permanent replacement", () => {
  const request = { ...baseRequest, quantity: 2, request_type: "permanent_replacement", expected_return_datetime: "" };
  assert.throws(
    () => validateInventoryRequest(request),
    /una sola unidad/i
  );
});
