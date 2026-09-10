/**
 * Script de importación masiva de empleados desde Excel a SIGTI
 * 
 * Lee el archivo "Informe empleados.xlsx" de la raíz del proyecto,
 * genera un username (nombre.apellido) único por empleado,
 * asigna el rol según el cargo, y los inserta en la base de datos.
 * 
 * Cargos de Sistemas (Rol 2):
 *   - Profesional De Sistemas
 *   - Auxiliar De Sistemas
 *   - Profesional De Telecomunicaciones
 * 
 * El resto de cargos reciben Rol 3 (Usuario externo)
 * 
 * Contraseña temporal para todos: petrocasinos2026
 * 
 * Uso:
 *   node scripts/importar-empleados.js
 * 
 * Ejecutar desde la carpeta /server
 */

import xlsx from 'xlsx';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configuración ────────────────────────────────────────────────────────────

const EXCEL_PATH = path.resolve(__dirname, '../../Informe empleados.xlsx');
const TEMP_PASSWORD = 'petrocasinos2026';
const ROL_SISTEMAS = 2;
const ROL_USUARIO = 3;
const DATA_START_ROW = 9; // Fila 10 en Excel (índice 9 base-0) - primera fila de datos

const CARGOS_SISTEMAS = [
  'profesional de sistemas',
  'auxiliar de sistemas',
  'profesional de telecomunicaciones',
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

function normalizarTexto(texto) {
  return (texto || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function asignarRol(cargo) {
  const cargoNorm = normalizarTexto(cargo);
  return CARGOS_SISTEMAS.some(c => cargoNorm.includes(c))
    ? ROL_SISTEMAS
    : ROL_USUARIO;
}

/**
 * Parsea el nombre completo del Excel.
 * El formato es "Nombre(s) Apellido1 Apellido2" donde los apellidos son las
 * últimas dos palabras y el nombre el resto.
 */
function parsearNombre(nombreCompleto) {
  const partes = nombreCompleto.trim().split(/\s+/);

  if (partes.length < 2) {
    return { name: partes[0] || '', firstLastName: '', secondLastName: '' };
  }

  if (partes.length === 2) {
    return { name: partes[0], firstLastName: partes[1], secondLastName: '' };
  }

  const secondLastName = partes.pop();
  const firstLastName = partes.pop();
  const name = partes.join(' ');
  return { name, firstLastName, secondLastName };
}

async function existsUsername(client, username) {
  const result = await client.query(
    'SELECT 1 FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
    [username]
  );
  return result.rowCount > 0;
}

async function generateUniqueUsername(client, name, firstLastName) {
  const base = `${normalizarTexto(name.split(' ')[0])}.${normalizarTexto(firstLastName)}`;
  let username = base;
  let counter = 1;

  while (await existsUsername(client, username)) {
    username = `${base}${counter}`;
    counter++;
  }

  return username;
}

// ─── Leer Excel ───────────────────────────────────────────────────────────────

function leerEmpleados() {
  const wb = xlsx.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

  return data.slice(DATA_START_ROW)
    .filter(row => row[0] && typeof row[0] === 'string' && row[0].trim().length > 0)
    .map(row => ({
      nombreCompleto: row[0].trim(),
      cargo: (row[1] || '').trim(),
    }));
}

// ─── Importación ──────────────────────────────────────────────────────────────

async function importar() {
  const empleados = leerEmpleados();
  console.log(`\n📋 Se encontraron ${empleados.length} empleados en el Excel.\n`);

  const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);
  const client = await pool.connect();

  let insertados = 0;
  let omitidos = 0;
  const errores = [];

  try {
    for (const emp of empleados) {
      try {
        const { name, firstLastName, secondLastName } = parsearNombre(emp.nombreCompleto);

        if (!name || !firstLastName) {
          console.warn(`  ⚠️  Nombre inválido, omitiendo: "${emp.nombreCompleto}"`);
          omitidos++;
          continue;
        }

        const username = await generateUniqueUsername(client, name, firstLastName);
        const roleId = asignarRol(emp.cargo);

        const fullLastName = secondLastName
          ? `${firstLastName} ${secondLastName}`
          : firstLastName;

        // Email placeholder — puede actualizarse después
        const email = `${username}@petrocasinos.com`;

        await client.query(
          `INSERT INTO users (name, lastname, username, email, password, role_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [name, fullLastName, username, email, hashedPassword, roleId]
        );

        const rolLabel = roleId === ROL_SISTEMAS ? 'Sistemas (2)' : 'Usuario  (3)';
        console.log(`  ✅  ${username.padEnd(35)} | Rol: ${rolLabel} | Cargo: ${emp.cargo}`);
        insertados++;
      } catch (err) {
        console.error(`  ❌  Error con "${emp.nombreCompleto}": ${err.message}`);
        errores.push({ nombre: emp.nombreCompleto, error: err.message });
      }
    }
  } finally {
    client.release();
  }

  console.log('\n─────────────────────────────────────────────────────────');
  console.log(`✅  Insertados:  ${insertados}`);
  console.log(`⏭️  Omitidos:    ${omitidos}`);
  console.log(`❌  Con errores: ${errores.length}`);
  if (errores.length > 0) {
    console.log('\nDetalles de errores:');
    errores.forEach(e => console.log(`  - ${e.nombre}: ${e.error}`));
  }
  console.log('\n🔑  Contraseña temporal: petrocasinos2026');
  console.log('─────────────────────────────────────────────────────────\n');

  await pool.end();
}

// ─── Ejecución ────────────────────────────────────────────────────────────────
importar().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
