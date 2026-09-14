const EQUIPMENT_TYPES = ["Portátil", "Torre", "All in One"];
const RAM_OPTIONS = ["4 GB", "8 GB", "12 GB", "16 GB", "32 GB", "64 GB"];
const OS_OPTIONS = ["Windows 10", "Windows 11", "Linux", "macOS"];
const SCREEN_OPTIONS = ["12 pulgadas", "13 pulgadas", "14 pulgadas", "15.6 pulgadas", "17 pulgadas", "19 pulgadas", "21.5 pulgadas", "23.8 pulgadas", "24 pulgadas"];
const ANTIVIRUS_OPTIONS = ["Sophos", "Defender"];

const required = (payload, field, label) => {
  if (!String(payload[field] || "").trim()) throw new Error(`${label} es obligatorio.`);
};

export const validateComputerAsset = (payload = {}) => {
  [
    ["asset_code", "El código de equipo"], ["ip_address", "La IP"], ["serial_number", "El serial"],
    ["processor", "El procesador"], ["brand", "La marca"], ["model", "El modelo"],
  ].forEach(([field, label]) => required(payload, field, label));
  required(payload, "area", "El área"); required(payload, "assigned_user", "El usuario");
  if (!EQUIPMENT_TYPES.includes(payload.equipment_type)) throw new Error("El tipo de equipo no es válido.");
  if (!RAM_OPTIONS.includes(payload.ram)) throw new Error("La RAM no es válida.");
  if (!OS_OPTIONS.includes(payload.operating_system)) throw new Error("El sistema operativo no es válido.");
  if (!SCREEN_OPTIONS.includes(payload.screen_size)) throw new Error("El tamaño de pantalla no es válido.");
  if (!ANTIVIRUS_OPTIONS.includes(payload.antivirus)) throw new Error("El antivirus no es válido.");
  if (!String(payload.hdd || "").trim() && !String(payload.ssd || "").trim()) throw new Error("Debes registrar al menos un almacenamiento HDD o SSD.");
  if (payload.nvme && !String(payload.ssd || "").trim()) throw new Error("NVMe solo puede marcarse cuando existe un SSD.");
  return {
    ...payload,
    category: "computer",
    name: `${String(payload.brand).trim()} ${String(payload.model).trim()}`,
    quantity: 1,
    available_quantity: 1,
    status: "available",
  };
};

export { ANTIVIRUS_OPTIONS, EQUIPMENT_TYPES, OS_OPTIONS, RAM_OPTIONS, SCREEN_OPTIONS };
