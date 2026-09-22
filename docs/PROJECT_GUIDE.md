# SIGTI: guía de proyecto

## Propósito y repositorios

SIGTI gestiona inventario de TI, préstamos, solicitudes, autenticación y mantenimiento. El espacio de trabajo contiene tres repositorios independientes. La [documentación de entrega interna](company/README.md) reúne el manual de usuario, la guía técnica y el procedimiento de migración y respaldo.

| Repositorio | Responsabilidad | Remoto |
| --- | --- | --- |
| `SIGTI-frontend` (`client/`) | Interfaz web React | `juliandrojas/SIGTI-frontend` |
| `SIGTI-backend` (`server/`) | API REST, autorización y PostgreSQL | `juliandrojas/SIGTI-backend` |
| `SIGTI-app` (`SIGTI-app/`) | Cliente Flutter en fase inicial | `juliandrojas/SIGTI-app` |

No existe un repositorio Git en la carpeta superior. Los cambios, ramas y commits se realizan dentro del repositorio afectado.

## Arquitectura

```text
React/Vite (client) -- JWT/JSON --> Express (server) -- pg --> PostgreSQL
                                     |
                                     +--> correo SMTP opcional para bienvenida de usuarios

Flutter (SIGTI-app) está separado y todavía no consume la API de forma documentada.
```

### Flujo principal

1. El cliente inicia sesión en `POST /users/login`.
2. El servidor devuelve el JWT y los datos del usuario, incluido `role_id`.
3. `client/src/api/axios.js` agrega el JWT a cada petición autenticada.
4. Express valida el token y los middlewares verifican los roles antes de ejecutar rutas.
5. Los módulos siguen el patrón `routes -> controller -> service -> repository -> PostgreSQL`.

### Roles soportados por la interfaz actual

| Rol | Acceso web | Responsabilidad |
| --- | --- | --- |
| 1 | `/sistemas` | Inventario de componentes, solicitudes, préstamos, equipos y mantenimiento. |
| 2 | `/usuario` | Crear y consultar solicitudes. |

La autorización debe aplicarse tanto en la interfaz como en la API. La interfaz no sustituye a un middleware del servidor.

## Puntos de entrada

| Necesidad | Ubicación |
| --- | --- |
| Rutas web | `client/src/App.jsx` |
| Navegación y permisos visuales | `client/src/layouts/`, `client/src/components/RoleProtectedRoute.jsx` |
| Cliente HTTP | `client/src/api/axios.js` |
| API Express | `server/index.js` |
| Usuarios y autenticación | `server/modules/users/` |
| Inventario y préstamos | `server/modules/inventory/` |
| Roles y middleware | `server/modules/roles/`, `server/middleware/` |
| Evolución del esquema | `server/modules/inventory/migrations/`; el esquema instalado se comprueba con un volcado actual de PostgreSQL |
| Cliente móvil | `SIGTI-app/lib/` |

## Desarrollo local

### API

```powershell
cd server
npm install
Copy-Item .env.example .env
npm run dev
```

La API requiere `SUPABASE_CONNECTION` o `DATABASE_URL` y `JWT_SECRET`; las variables de correo se usan si se necesita enviar bienvenida al crear usuarios. `.env.example` no contiene una conexión de ejemplo: hay que configurarla en privado. Nunca se versiona `.env` ni se comparte su contenido en memorias de agentes. La conexión `config/db.js` solicita SSL; para un PostgreSQL propio, comprobar la compatibilidad antes del corte.

### Interfaz web

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

`VITE_API_URL` apunta a la API. Sin esa variable, el cliente usa como respaldo la URL de producción configurada en `client/src/api/axios.js`, incluso durante desarrollo local.

### Validación

| Repositorio | Comando |
| --- | --- |
| `client` | `npm run lint` y `npm run build` |
| `server` | `npm test` cuando el entorno de base de datos de prueba esté configurado; para cambios aislados, `node --check <archivo>` |
| `SIGTI-app` | `flutter analyze` y `flutter test` |

## Trabajo con varios agentes

1. Asigna un agente por repositorio o por cambio independiente. No dos agentes editan el mismo archivo.
2. Cada agente empieza leyendo el `AGENTS.md` de su repositorio y esta guía.
3. Mantén cambios de cliente y servidor en ramas separadas, con mensajes de commit descriptivos.
4. Para un cambio de contrato API, el agente del servidor documenta método, ruta, permisos, cuerpo y respuesta; el agente del cliente implementa contra ese contrato.
5. Antes de integrar, ejecuta la validación de cada repositorio afectado y registra cualquier limitación.
6. No uses memorias de agentes para secretos, datos personales masivos ni estado de producción. La documentación versionada es la fuente de verdad.

## Dos entornos de trabajo

En ambos computadores, clona los tres repositorios como carpetas hermanas y conserva la misma estructura:

```text
SIGTI/
  client/
  server/
  SIGTI-app/
```

- Comparte mediante Git solo código, documentación y archivos de ejemplo.
- Crea `.env` localmente en cada equipo a partir de `.env.example`.
- Antes de empezar, ejecuta `git status` y `git pull --ff-only` dentro de cada repositorio que vayas a tocar.
- Antes de cambiar de equipo, valida, confirma los cambios y súbelos al remoto. No dependas de archivos sin confirmar en la carpeta superior.
- Si usas ECC Memory Vault, instala primero el runtime `ecc-universal` en cada equipo y configura los dos entornos con el mismo directorio raíz de los repositorios. Usa memoria para handoffs breves; usa esta documentación para decisiones persistentes.

## Documentación que debe mantenerse

- Actualiza esta guía cuando cambien arquitectura, roles, comandos, rutas API o la relación entre repositorios.
- Mantén `docs/company/README.md` como índice y estado de preparación de la entrega; actualiza solo el manual o procedimiento afectado por cada cambio.
- Añade una nota de decisión en `server/docs/decisions/` cuando una elección afecte a más de un repositorio.
- Documenta contratos de endpoints en `server/docs/api/` cuando se agreguen o modifiquen rutas.
- Si se crea un repositorio de documentación compartida en el futuro, muéstralo como fuente canónica y reemplaza duplicaciones locales por enlaces.

## Estado conocido

- El cliente y el servidor son repositorios distintos, con despliegue configurado para Vercel. La futura base propia en servidor sigue pendiente de migración y verificación.
- El cliente móvil Flutter existe, pero su README aún es el generado por Flutter y no hay una integración API verificada.
- La terminal actual no tiene disponible el ejecutable `ecc`; por eso todavía no se ha inicializado ni validado el Memory Vault desde línea de comandos.
