/**
 * Script de importación masiva de empleados a SIGTI
 * 
 * Lee el archivo "Informe empleados con area.xlsx", omite los metadatos/encabezados,
 * asigna Rol 1 (sistemas) a las 4 personas del área TI y Rol 2 (usuario) al resto.
 * Contraseña por defecto para todos: petrocasinos2026
 * 
 * Ejecutar desde la carpeta /server:
 *   node scripts/importar-empleados.js
 */

import xlsx from 'xlsx';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configuración ────────────────────────────────────────────────────────────

const EXCEL_PATH = path.resolve(__dirname, '../../Informe empleados con area.xlsx');
const TEMP_PASSWORD = 'petrocasinos2026';

const ROL_SISTEMAS = 1;
const ROL_USUARIOS = 2;

// ─── Utilidades ───────────────────────────────────────────────────────────────

function normalizarTexto(texto) {
  return (texto || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizarParaUsername(texto) {
  return normalizarTexto(texto).replace(/[^a-z0-9]/g, '');
}

/**
 * Valida si el registro corresponde a una persona del área de sistemas
 */
function asignarRol(area = '', cargo = '') {
  const areaNorm = normalizarTexto(area);
  const cargoNorm = normalizarTexto(cargo);

  const esSistemas = areaNorm.includes('sistema') ||
    areaNorm.includes('tecnolog') ||
    cargoNorm.includes('sistemas') ||
    cargoNorm.includes('telecomunicaciones');

  return esSistemas ? ROL_SISTEMAS : ROL_USUARIOS;
}

/**
 * Parsea el nombre separando nombres y apellidos reales
 */
function parsearNombre(nombreCompleto) {
  const partes = (nombreCompleto || '').toString().trim().split(/\s+/);

  if (partes.length < 2) {
    return { name: partes[0] || '', firstLastName: '', secondLastName: '' };
  }

  if (partes.length === 2) {
    return { name: partes[0], firstLastName: partes[1], secondLastName: '' };
  }

  const secondLastName = partes.pop();
  let firstLastName = partes.pop();

  const particulas = ['de', 'del', 'la', 'las', 'los', 'san'];
  if (partes.length > 0 && particulas.includes(partes[partes.length - 1].toLowerCase())) {
    firstLastName = `${partes.pop()} ${firstLastName}`;
  }

  const name = partes.join(' ');
  return { name, firstLastName, secondLastName };
}

async function existsUser(client, username, email) {
  const result = await client.query(
    'SELECT 1 FROM public.users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2) LIMIT 1',
    [username, email]
  );
  return result.rowCount > 0;
}

async function generateUniqueCredentials(client, name, firstLastName) {
  const apellidoClave = firstLastName.split(/\s+/).pop();
  const base = `${normalizarParaUsername(name.split(' ')[0])}.${normalizarParaUsername(apellidoClave)}`;

  let username = base;
  let email = `${username}@petrocasinos.com`;
  let counter = 1;

  while (await existsUser(client, username, email)) {
    username = `${base}${counter}`;
    email = `${username}@petrocasinos.com`;
    counter++;
  }

  return { username, email };
}

// ─── Leer Excel y Filtrar Encabezados ──────────────────────────────────────────

function leerEmpleadosConArea() {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`No se encontró el archivo: "${EXCEL_PATH}". Asegúrate de que esté en la raíz.`);
  }

  const wb = xlsx.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });

  // Frases o palabras clave presentes en la cabecera que deben descartarse
  const patronesIgnorados = [
    'empleado',
    'generado',
    'incluido',
    'campo seleccionado',
    'nombre completo',
    'cargo',
    'area'
  ];

  return rows
    .filter(row => {
      if (!row || !row[0]) return false;

      const celdaTexto = normalizarTexto(row[0]);

      // Si la celda es muy corta o contiene texto de encabezado/reporte, se ignora
      if (celdaTexto.length < 4) return false;
      const esEncabezado = patronesIgnorados.some(patron => celdaTexto.includes(patron));
      if (esEncabezado) return false;

      // Debe contener al menos dos palabras (nombre y apellido)
      const palabras = celdaTexto.split(/\s+/).filter(Boolean);
      return palabras.length >= 2;
    })
    .map(row => ({
      nombreCompleto: String(row[0]).trim(),
      cargo: row[1] ? String(row[1]).trim() : '',
      area: row[2] ? String(row[2]).trim() : ''
    }));
}

// ─── Proceso de Inserción Masiva ──────────────────────────────────────────────

async function importar() {
  console.log(`\n📖 Leyendo archivo y limpiando metadatos...`);
  const empleados = leerEmpleadosConArea();
  console.log(`📋 Se validaron ${empleados.length} empleados reales para importar.\n`);

  if (empleados.length === 0) {
    console.error('❌ No se encontraron datos válidos.');
    process.exit(1);
  }

  // Precalcula el hash una sola vez para que la ejecución tarde pocos segundos
  const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);
  const client = await pool.connect();

  let insertados = 0;
  let sistemasCount = 0;
  let usuariosCount = 0;
  let omitidos = 0;
  const errores = [];

  try {
    for (const emp of empleados) {
      try {
        const { name, firstLastName, secondLastName } = parsearNombre(emp.nombreCompleto);

        if (!name || !firstLastName) {
          console.warn(`  ⚠️ Nombre no procesable: "${emp.nombreCompleto}"`);
          omitidos++;
          continue;
        }

        const { username, email } = await generateUniqueCredentials(client, name, firstLastName);
        const roleId = asignarRol(emp.area, emp.cargo);

        const fullLastName = secondLastName
          ? `${firstLastName} ${secondLastName}`
          : firstLastName;

        // Inserción directa en users respetando el esquema oficial
        await client.query(
          `INSERT INTO public.users (name, lastname, username, email, password, role_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (username) DO NOTHING`,
          [name, fullLastName, username, email, hashedPassword, roleId]
        );

        if (roleId === ROL_SISTEMAS) {
          sistemasCount++;
          console.log(`  💻 [SISTEMAS (1)]  ${username.padEnd(25)} | ${emp.nombreCompleto} | Área: ${emp.area || 'N/A'}`);
        } else {
          usuariosCount++;
          console.log(`  👤 [USUARIO  (2)]  ${username.padEnd(25)} | ${emp.nombreCompleto}`);
        }

        insertados++;
      } catch (err) {
        console.error(`  ❌ Error con "${emp.nombreCompleto}": ${err.message}`);
        errores.push({ nombre: emp.nombreCompleto, error: err.message });
      }
    }
  } finally {
    client.release();
  }

  console.log('\n─────────────────────────────────────────────────────────');
  console.log(`✅ Total registros insertados: ${insertados}`);
  console.log(`💻 Rol Sistemas (1) - Admin:  ${sistemasCount}`);
  console.log(`👤 Rol Usuarios (2):          ${usuariosCount}`);
  console.log(`⏭️ Omitidos:                   ${omitidos}`);
  console.log(`❌ Errores:                    ${errores.length}`);
  console.log(`🔑 Contraseña asignada:        ${TEMP_PASSWORD}`);
  console.log('─────────────────────────────────────────────────────────\n');

  await pool.end();
}

importar().catch(err => {
  console.error('Error fatal al importar:', err);
  process.exit(1);
});