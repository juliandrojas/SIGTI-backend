-- Migra los valores históricos antes de retirar category y equipment_type.
UPDATE inventory_items
SET asset_type = CASE
  WHEN equipment_type ILIKE 'port%' OR category ILIKE 'port%' THEN 'laptop'
  WHEN equipment_type ILIKE 'aio' OR equipment_type ILIKE 'all%' THEN 'all_in_one'
  WHEN equipment_type ILIKE 'torre%' THEN 'tower'
  ELSE 'peripheral'
END
WHERE asset_type IS NULL;
