import pool from "../config/db.js";
import { createUser } from "../modules/users/user.repository.js";


async function runTest() {
  try {
    console.log("Probando creación de usuario...");
    
    const user1 = await createUser(
      "Julian",
      "Rojas",
      "Alvarez",
      "julian.test@petrocasinos.com",
      "Clave123*"
    );
    console.log(" Usuario 1 creado con éxito:", user1);

    // Prueba de colisión: crear otro usuario con el mismo nombre y primer apellido
    console.log("\nProbando resolución de nombre de usuario duplicado...");
    const user2 = await createUser(
      "Julian",
      "Rojas",
      "Gomez",
      "julian.gomez@petrocasinos.com",
      "Clave123*"
    );
    console.log(" Usuario 2 creado con éxito:", user2);

  } catch (error) {
    console.error("❌ Error en la prueba:", error.message);
  } finally {
    // Cerrar el pool para que el script termine
    await pool.end();
  }
}

runTest();