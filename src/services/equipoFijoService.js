import { getAllEquipos } from "./equipamiento";

// GET /equipo ahora devuelve un objeto paginado { total, page, limit, equipos }.
// Los consumidores (laboratorios.jsx, edificios.jsx) esperan un array plano y
// hacen .filter sobre él, así que delegamos en getAllEquipos, que recorre todas
// las páginas y devuelve el array completo.
export const obtenerEquipos = async () => getAllEquipos();
