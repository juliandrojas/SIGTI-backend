-- Actualiza los códigos históricos de equipos Petrocasinos.
-- Portátiles: PPOEF..., torres y AIO: PPCEF...
BEGIN;

UPDATE inventory_items
SET asset_code = CASE
  WHEN LOWER(COALESCE(equipment_type, '')) LIKE 'port%'
    THEN 'PPO' || asset_code
  ELSE 'PPC' || asset_code
END,
updated_at = NOW()
WHERE category = 'computer'
  AND asset_code ~ '^EF[0-9]{3,4}$';

COMMIT;
