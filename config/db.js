import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.SUPABASE_CONNECTION ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta SUPABASE_CONNECTION o DATABASE_URL en las variables de entorno");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;