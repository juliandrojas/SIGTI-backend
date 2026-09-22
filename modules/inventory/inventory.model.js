export const inventoryItemModel = {
  id: 'id',
  name: 'name',
  asset_type: 'asset_type',
  brand: 'brand',
  model: 'model',
  serial_number: 'serial_number',
  quantity: 'quantity',
  available_quantity: 'available_quantity',
  condition: 'condition',
  notes: 'notes',
  created_at: 'created_at',
  updated_at: 'updated_at',
};

export const inventoryLoanModel = {
  id: 'id',
  item_id: 'item_id',
  quantity: 'quantity',
  requested_by: 'requested_by',
  position: 'position',
  start_datetime: 'start_datetime',
  expected_return_datetime: 'expected_return_datetime',
  actual_return_datetime: 'actual_return_datetime',
  return_signature: 'return_signature',
  status: 'status',
  notes: 'notes',
  created_at: 'created_at',
};
