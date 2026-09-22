# Manual de usuario — SIGTI web

SIGTI permite solicitar periféricos, administrar inventario de componentes y registrar el mantenimiento semestral de computadores. Las opciones visibles dependen del rol de la cuenta.

## Acceso

1. Abre la dirección web proporcionada por Sistemas.
2. Escribe tu usuario y contraseña en **Iniciar sesión**.
3. Al terminar, usa **Cerrar sesión**. Si la sesión caduca, vuelve a ingresar.

No compartas la sesión abierta ni incluyas credenciales en solicitudes o capturas. Si no puedes entrar, informa a Sistemas el nombre de usuario y el mensaje de error, **nunca la contraseña**.

## Colaborador: solicitudes

En **Hacer una solicitud** (`/usuario/requests`):

1. Verifica el solicitante y el área precargados.
2. Elige **Préstamo temporal** o **Cambio definitivo** y selecciona el periférico.
3. Para un préstamo temporal indica cantidad y devolución esperada. El formulario muestra la disponibilidad; no permite solicitar más unidades de las disponibles.
4. Agrega el motivo si hace falta y pulsa **Enviar solicitud**.

En **Mis solicitudes** (`/usuario/requests/history`) puedes buscar por elemento y filtrar por tipo o estado. Los estados mostrados son pendiente, entregada, rechazada y devuelta, según el trámite. Si un elemento no aparece o no está disponible, contacta a Sistemas; no registres una solicitud duplicada para intentar reservarlo.

## Sistemas: tablero e inventario

- **Inicio** (`/sistemas`) resume tipos, unidades totales, disponibles y prestadas de periféricos. La sección de equipos muestra mantenimientos vencidos, próximos 30 días y al día según el último mantenimiento de cada computador.
- **Inventario** (`/sistemas/inventory`) muestra periféricos y el formulario **Registrar equipo**. Permite buscar, crear, editar y eliminar artículos periféricos; la columna **Disponibles** muestra unidades disponibles, no una fracción. Antes de eliminar, comprueba que no existan solicitudes o préstamos asociados.
- **Préstamos y solicitudes** (`/sistemas/loans`) permite revisar solicitudes, entregar o rechazar y registrar la devolución de préstamos temporales. Verifica físicamente la entrega/devolución antes de confirmarla en SIGTI.

## Sistemas: equipos y mantenimiento

Para registrar un equipo, ve a **Inventario** (`/sistemas/inventory`):

Completa **Registrar equipo**. Indica empresa, tipo (portátil, torre o todo en uno), código `EF` seguido de 3 o 4 dígitos y los datos técnicos. SIGTI antepone `PPO`/`PPC` para Petrocasinos o `CPO`/`CPC` para Cosecharte según el tipo. No uses un código completo en el campo EF.

En **Mantenimiento** (`/sistemas/maintenance`):

1. Para registrar un mantenimiento, busca el equipo por código, nombre o serial. Selecciónalo de la lista y confirma la **fecha realizada** y las observaciones. La próxima fecha se calcula seis meses después. Las actividades obligatorias son limpieza interna y cambio de pasta térmica.
2. En **Historial de Mantenimiento**, usa **Editar** para corregir la fecha, observaciones o dirección IP. Guardar la IP cambia el dato del **equipo**, no solo el registro histórico. Una IP vacía deja el equipo sin IP definida. La próxima fecha se vuelve a calcular al modificar la fecha realizada.

Si SIGTI informa que el equipo tiene un mantenimiento reciente, revisa el historial antes de intentar otro registro. Para corregir un mantenimiento existente usa **Editar**, sin crear uno duplicado. Las fechas de la interfaz se muestran como `DD-MM-AAAA`.

## Si algo falla

- Recarga la página una vez y comprueba que sigues con sesión iniciada.
- No repitas una operación de guardar o entregar hasta comprobar si el registro apareció: podría duplicarse o descontar existencias.
- Informa a Sistemas la pantalla, la hora aproximada, el código de equipo o artículo y el mensaje mostrado. No envíes contraseñas ni exportaciones completas de la base por canales no autorizados.
