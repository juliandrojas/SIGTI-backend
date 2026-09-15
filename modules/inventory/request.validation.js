const types = ["temporary_loan", "permanent_replacement"];

const parseColombiaDateTime = (value) => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = "0"] = match;
  const parts = [Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second)];
  const wallClock = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
  if (Number.isNaN(wallClock.getTime()) || wallClock.getUTCFullYear() !== parts[0] || wallClock.getUTCMonth() + 1 !== parts[1] || wallClock.getUTCDate() !== parts[2] || wallClock.getUTCHours() !== parts[3] || wallClock.getUTCMinutes() !== parts[4] || wallClock.getUTCSeconds() !== parts[5]) return null;
  return { instant: new Date(wallClock.getTime() + 5 * 60 * 60 * 1000), day: wallClock.getUTCDay(), minutes: parts[3] * 60 + parts[4] };
};

export const validateInventoryRequest = (payload = {}) => {
  const request = { ...payload };
  if (!Number.isInteger(Number(request.item_id)) || Number(request.item_id) <= 0) throw new Error("El artículo seleccionado no es válido.");
  if (!Number.isInteger(Number(request.quantity)) || Number(request.quantity) <= 0) throw new Error("La cantidad debe ser un entero mayor que cero.");
  if (!types.includes(request.request_type)) throw new Error("El tipo de solicitud no es válido.");
  if (!String(request.position || "").trim()) throw new Error("El área del solicitante es obligatoria.");
  if (request.request_type === "permanent_replacement" && Number(request.quantity) !== 1) throw new Error("Los cambios definitivos deben solicitarse por una sola unidad.");
  if (request.request_type === "temporary_loan") {
    if (!request.expected_return_datetime) throw new Error("La fecha esperada de devolución es obligatoria para un préstamo temporal.");
    const expectedReturn = parseColombiaDateTime(request.expected_return_datetime);
    if (!expectedReturn || expectedReturn.instant <= new Date()) throw new Error("La fecha de devolución debe ser posterior a la fecha y hora actuales.");
    if (expectedReturn.day === 0 || expectedReturn.day === 6) throw new Error("La devolución debe programarse de lunes a viernes.");
    if (expectedReturn.minutes < 480 || expectedReturn.minutes > 1020 || (expectedReturn.minutes > 720 && expectedReturn.minutes < 780)) throw new Error("La devolución debe estar dentro del horario de atención: lunes a viernes, de 08:00 a 12:00 y de 13:00 a 17:00.");
  }
  return request;
};
