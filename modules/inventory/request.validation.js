const types = ["temporary_loan", "permanent_replacement"];

export const validateInventoryRequest = (payload = {}) => {
  const request = { ...payload };
  if (!Number.isInteger(Number(request.item_id)) || Number(request.item_id) <= 0) throw new Error("El artículo seleccionado no es válido.");
  if (!Number.isInteger(Number(request.quantity)) || Number(request.quantity) <= 0) throw new Error("La cantidad debe ser un entero mayor que cero.");
  if (!types.includes(request.request_type)) throw new Error("El tipo de solicitud no es válido.");
  if (!String(request.position || "").trim()) throw new Error("El área del solicitante es obligatoria.");
  if (request.request_type === "permanent_replacement" && Number(request.quantity) !== 1) throw new Error("Los cambios definitivos deben solicitarse por una sola unidad.");
  if (request.request_type === "temporary_loan") {
    if (!request.expected_return_datetime) throw new Error("La fecha esperada de devolución es obligatoria para un préstamo temporal.");
    const expectedReturn = new Date(request.expected_return_datetime);
    if (Number.isNaN(expectedReturn.getTime()) || expectedReturn <= new Date()) throw new Error("La fecha de devolución debe ser posterior a la fecha y hora actuales.");
    const day = expectedReturn.getDay();
    const minutes = expectedReturn.getHours() * 60 + expectedReturn.getMinutes();
    if (day === 0 || day === 6) throw new Error("La devolución debe programarse de lunes a viernes.");
    if (minutes < 480 || minutes > 1020 || (minutes > 720 && minutes < 780)) throw new Error("La devolución debe estar dentro del horario de atención: lunes a viernes, de 08:00 a 12:00 y de 13:00 a 17:00.");
  }
  return request;
};
