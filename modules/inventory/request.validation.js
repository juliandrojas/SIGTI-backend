const types = ["temporary_loan", "permanent_replacement"];

export const validateInventoryRequest = (payload = {}) => {
  const request = { ...payload };
  if (!Number.isInteger(Number(request.item_id)) || Number(request.item_id) <= 0) throw new Error("El artículo seleccionado no es válido.");
  if (!Number.isInteger(Number(request.quantity)) || Number(request.quantity) <= 0) throw new Error("La cantidad debe ser un entero mayor que cero.");
  if (!types.includes(request.request_type)) throw new Error("El tipo de solicitud no es válido.");
  if (!String(request.position || "").trim()) throw new Error("El área del solicitante es obligatoria.");
  if (request.request_type === "temporary_loan" && !request.expected_return_datetime) throw new Error("La fecha esperada de devolución es obligatoria para un préstamo temporal.");
  return request;
};
