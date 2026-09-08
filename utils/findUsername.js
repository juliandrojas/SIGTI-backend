import pool from "../config/db.js";

// Verificamos si el nombre de usuario
export const existsUsername = async (username) => {
    const query = "SELECT 1 FROM users WHERE username =$1 LIMIT 1";
    const result = await pool.query(query, [username]);
    return result.rowCount > 0;
}
// Generamos el username verificando duplicados
export const generateUniqueUsername = async (name, firstLastName, secondLastName) => {
    const cleanName = sanitizeText(name);
    const cleanFirst = sanitizeText(firstLastName);
    const cleanSecond = sanitizeText(secondLastName);
    // Opción 1: nombre.primerApellido
    const baseUsername = `${cleanName}.${cleanFirst}`;
    const baseExists = await existsUsername(baseUsername);
    if(!baseExists) return baseUsername;
    // Opción 2: Si ya existe y hay segundo apellido, usar nombre.primerApellido.segundoApellido
    if(cleanSecond) {
        const extendedUsername = `${cleanName}.${cleanFirst}.${cleanSecond}`;
        const extendedExists = await existsUsername(extendedUsername);
        if(!extendedExists) return extendedUsername;
    }
    // Opción 3 (Respaldo): Si colisiona o no hay segundo apellido, agregar un sufijo numérico
    let counter = 1;
    let candidate = `${baseUsername}${counter}`;
    while(await existsUsername(candidate)) {
        counter ++;
        candidate =  `${baseUsername}${counter}`;
    }
    return candidate;
};