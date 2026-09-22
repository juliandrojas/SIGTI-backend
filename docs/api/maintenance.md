# Mantenimiento

Todas las rutas usan el prefijo `/inventory`, requieren JWT y el rol de Sistemas/administrador.

## Editar un registro

`PATCH /inventory/maintenance/:id`

Cuerpo JSON:

```json
{
  "performed_at": "2026-09-22",
  "notes": "Cambio de RAM: 12 GB"
}
```

`performed_at` es obligatorio y debe ser una fecha real con formato `AAAA-MM-DD`. `notes` puede ser una cadena vacía; en ese caso se guarda como `null`. La API calcula `next_due_date` seis meses después de `performed_at` y devuelve el registro actualizado. No cambia el equipo, el técnico ni las actividades registradas.

- `200`: registro actualizado.
- `400`: identificador, fecha o cuerpo inválidos.
- `401`/`403`: falta autenticación o permiso.
- `404`: el registro no existe.
