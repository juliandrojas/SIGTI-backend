// src/utils/format.js
export const sanitizeText = (text) => {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    // Remueve acentos y tildes (ej: 'Ángel' -> 'angel', 'Pérez' -> 'perez')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Remueve caracteres no alfanuméricos excepto puntos
    .replace(/[^a-z0-9]/g, "");
};