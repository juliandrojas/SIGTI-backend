# Instrucciones para agentes: SIGTI Backend

Lee primero `docs/PROJECT_GUIDE.md`. Este repositorio implementa la API Express y la autorización.

- Conserva el patrón `routes -> controller -> service -> repository`.
- Protege toda operación sensible en el servidor; no confíes en restricciones de la interfaz.
- No cambies el esquema ni variables de entorno sin documentar el impacto y un plan de migración.
- No imprimas ni confirmes secretos de `.env`, conexiones PostgreSQL, JWT o credenciales SMTP.
- Para cambios de contrato, documenta el endpoint en `docs/api/` antes de solicitar cambios del cliente.
- Valida sintaxis y ejecuta las pruebas disponibles antes de entregar.
- Respeta cambios no relacionados presentes en el árbol de trabajo.
