import assert from "node:assert/strict";
import test from "node:test";
import { validateInventoryRequest } from "./request.validation.js";

const baseRequest = {
  item_id: 4,
  quantity: 1,
  request_type: "temporary_loan",
  expected_return_datetime: "2099-01-05T10:00:00",
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
    /anterior al día de hoy/i
  );
});

test("rejects a return date outside the support schedule", () => {
  assert.throws(
    () => validateInventoryRequest({ ...baseRequest, expected_return_datetime: "2099-01-10T10:00:00" }),
    /lunes a viernes/i
  );
  assert.throws(
    () => validateInventoryRequest({ ...baseRequest, expected_return_datetime: "2099-01-05T12:30:00" }),
    /horario de atención/i
  );
});

test("interprets a valid same-day return using Colombia time", () => {
  const now = new Date();
  const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  while (["Sat", "Sun"].includes(new Intl.DateTimeFormat("en-US", { timeZone: "America/Bogota", weekday: "short" }).format(future))) future.setTime(future.getTime() + 24 * 60 * 60 * 1000);
  const dateParts = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(future).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  const date = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  const request = { ...baseRequest, expected_return_datetime: `${date}T10:00:00` };
  assert.doesNotThrow(() => validateInventoryRequest(request));
});

test("requires exactly one unit for a permanent replacement", () => {
  const request = { ...baseRequest, quantity: 2, request_type: "permanent_replacement", expected_return_datetime: "" };
  assert.throws(
    () => validateInventoryRequest(request),
    /una sola unidad/i
  );
});
