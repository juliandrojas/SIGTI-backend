const EQUIPMENT_TYPES = ["Portátil", "Torre", "All in One"];
const RAM_OPTIONS = ["4 GB", "8 GB", "12 GB", "16 GB", "32 GB", "64 GB"];
const OS_OPTIONS = ["WIN 10 Pro", "WIN 10 Single Lenguaje", "WIN 11 Pro", "WIN 7 Pro", "WIN 8.1 Single Lenguaje", "MacOS", "WIN 11 Single Lenguaje", "WIN 11 Pro For Workstations"];
const SCREEN_OPTIONS = ["12 pulgadas", "13 pulgadas", "14 pulgadas", "15.6 pulgadas", "17 pulgadas", "19 pulgadas", "21.5 pulgadas", "23.8 pulgadas", "24 pulgadas"];
const ANTIVIRUS_OPTIONS = ["Sophos", "Defender"];
const COMPANY_PREFIXES = {
  Petrocasinos: { "Portátil": "PPO", Torre: "PPC", "All in One": "PPC" },
  Cosecharte: { "Portátil": "CPO", Torre: "CPC", "All in One": "CPC" },
};

const required = (payload, field, label) => {
  if (!String(payload[field] || "").trim()) throw new Error(`${label} es obligatorio.`);
};

export const validateComputerAsset = (payload = {}) => {
  [
    ["asset_code", "El código de equipo"], ["ip_address", "La IP"], ["serial_number", "El serial"],
    ["processor", "El procesador"], ["brand", "La marca"], ["model", "El modelo"],
  ].forEach(([field, label]) => required(payload, field, label));
  const assetCode = String(payload.asset_code).trim().toUpperCase();
  if (!/^(?:(?:PPC|PPO|CPC|CPO))?EF\d{3,4}$/.test(assetCode)) {
    throw new Error("El código debe tener el formato EF seguido de 3 o 4 dígitos.");
  }
  required(payload, "area", "El área"); required(payload, "assigned_user", "El usuario");
  if (!EQUIPMENT_TYPES.includes(payload.equipment_type)) throw new Error("El tipo de equipo no es válido.");
  if (!RAM_OPTIONS.includes(payload.ram)) throw new Error("La RAM no es válida.");
  if (!OS_OPTIONS.includes(payload.operating_system)) throw new Error("El sistema operativo no es válido.");
  if (!SCREEN_OPTIONS.includes(payload.screen_size)) throw new Error("El tamaño de pantalla no es válido.");
  if (!ANTIVIRUS_OPTIONS.includes(payload.antivirus)) throw new Error("El antivirus no es válido.");
  if (payload.company !== undefined) {
    if (!Object.hasOwn(COMPANY_PREFIXES, payload.company)) throw new Error("La empresa no es válida.");
    const expectedPrefix = COMPANY_PREFIXES[payload.company][payload.equipment_type];
    if (!assetCode.startsWith(expectedPrefix)) throw new Error(`El código debe comenzar por ${expectedPrefix} para la empresa y tipo seleccionados.`);
  }
  if (!String(payload.hdd || "").trim() && !String(payload.ssd || "").trim()) throw new Error("Debes registrar al menos un almacenamiento HDD o SSD.");
  if (payload.nvme && !String(payload.ssd || "").trim()) throw new Error("NVMe solo puede marcarse cuando existe un SSD.");
  return {
    ...payload,
    asset_code: assetCode,
    category: "computer",
    name: `${String(payload.brand).trim()} ${String(payload.model).trim()}`,
    quantity: 1,
    available_quantity: 1,
    status: "available",
  };
};

export { ANTIVIRUS_OPTIONS, COMPANY_PREFIXES, EQUIPMENT_TYPES, OS_OPTIONS, RAM_OPTIONS, SCREEN_OPTIONS };
