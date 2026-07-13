import api from "../api/axios";

// Obtener Items paginados. Devuelve { total, page, limit, items } y cada item
// trae stockDisponible calculado por el backend. `tipo` solo acepta
// sustancia|reactivo|material ("equipo" devuelve 400).
export const getItems = async ({ q, tipo, esConsumible, page, limit, sort, order } = {}) => {
  try {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (tipo) params.append("tipo", tipo);
    if (esConsumible !== undefined) params.append("esConsumible", esConsumible);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (sort) params.append("sort", sort);
    if (order) params.append("order", order);

    const response = await api.get(`/items${params.toString() ? "?" + params.toString() : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener items:", error);
    throw error;
  }
};

// Estadísticas agregadas para las tarjetas superiores.
// GET /items/estadisticas -> { equipos, materiales, reactivos, sustancias, descartes }
export const getEstadisticasItems = async () => {
  try {
    const response = await api.get("/items/estadisticas");
    return response.data;
  } catch (error) {
    console.error("Error al obtener estadísticas de items:", error);
    throw error;
  }
};

// Estadísticas de uso de equipos (ranking por cantidad de reservas Finalizadas
// en un período). Sirve para priorizar mantenimiento: los primeros del ranking
// son los más usados. GET /equipo/estadisticas-uso ->
//   { periodo, desde, hasta, paginacion: { page, limit, total, totalPaginas },
//     equipos: [{ equipoId, usos, nombre, codigo, tipo, estado }] }  (usos desc)
// Requiere rol PERSONAL/ADMIN (el JWT lo agrega el interceptor).
export const getEstadisticasUso = async ({ periodo, fecha, laboratorioId, equipoId, page, limit } = {}) => {
  try {
    const params = new URLSearchParams();
    if (periodo) params.append("periodo", periodo);
    if (fecha) params.append("fecha", fecha instanceof Date ? fecha.toISOString() : fecha);
    if (laboratorioId) params.append("laboratorioId", laboratorioId);
    if (equipoId) params.append("equipoId", equipoId);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const response = await api.get(`/equipo/estadisticas-uso${params.toString() ? "?" + params.toString() : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener estadísticas de uso de equipos:", error);
    throw error;
  }
};

// Obtener un Item por ID
export const getItemById = async (itemId) => {
  try {
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener item ${itemId}:`, error);
    throw error;
  }
};

// Vista de stock de un Item por ventana temporal (GET /items/:id/stock).
// `desde`/`hasta` (ISO) opcionales; omitidos = el día actual. Devuelve
// { itemId, desde, hasta, total, disponible, aceptado[], enUso[] }, donde:
//  - total: stock físico PRESENTE ahora (baja si hay stock "en uso").
//  - disponible: lo RESERVABLE en la ventana (usar SIEMPRE este valor para "cuánto
//    puedo reservar"; total − (aceptado + enUso) NO equivale a disponible).
//  - aceptado/enUso: reservas Pendiente / En Curso que pesan sobre la ventana.
export const getStockItem = async (itemId, { desde, hasta } = {}) => {
  try {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    const response = await api.get(`/items/${itemId}/stock`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener stock del item ${itemId}:`, error);
    throw error;
  }
};

// Obtener Lotes (orden FEFO). Respuesta DUAL:
//  - sin page/limit  -> array de lotes (retrocompatible).
//  - con page/limit   -> objeto { total, page, limit, lotes }.
export const getLotes = async ({ itemId, estado, ubicacion, page, limit } = {}) => {
  try {
    const params = new URLSearchParams();
    if (itemId) params.append("itemId", itemId);
    if (estado) params.append("estado", estado);
    if (ubicacion) params.append("ubicacion", ubicacion);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const response = await api.get(`/lotes${params.toString() ? "?" + params.toString() : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener lotes:", error);
    throw error;
  }
};

// Obtener Lotes de un Item específico
export const getLotesByItemId = async (itemId) => {
  try {
    const response = await api.get(`/lotes?itemId=${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener lotes del item ${itemId}:`, error);
    throw error;
  }
};

// Obtener un Lote por ID
export const getLoteById = async (loteId) => {
  try {
    const response = await api.get(`/lotes/${loteId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener lote ${loteId}:`, error);
    throw error;
  }
};

// Crear un nuevo Item
export const createItem = async (itemData) => {
  try {
    const response = await api.post("/items", itemData);
    return response.data;
  } catch (error) {
    console.error("Error al crear item:", error);
    throw error;
  }
};

// Crear un nuevo Lote
export const createLote = async (loteData) => {
  try {
    const payload = {
      ...loteData,
      movilidad: loteData?.movilidad || "Fija",
    };
    const response = await api.post("/lotes", payload);
    return response.data;
  } catch (error) {
    console.error("Error al crear lote:", error);
    throw error;
  }
};

// Actualizar un Item
export const updateItem = async (itemId, itemData) => {
  try {
    const response = await api.put(`/items/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar item ${itemId}:`, error);
    throw error;
  }
};

// Actualizar un Lote
export const updateLote = async (loteId, loteData) => {
  try {
    const payload = {
      ...loteData,
      movilidad: loteData?.movilidad || "Fija",
    };
    const response = await api.put(`/lotes/${loteId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar lote ${loteId}:`, error);
    throw error;
  }
};

// Eliminar un Item
export const deleteItem = async (itemId) => {
  try {
    const response = await api.delete(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar item ${itemId}:`, error);
    throw error;
  }
};

// Eliminar un Lote
export const deleteLote = async (loteId) => {
  try {
    const response = await api.delete(`/lotes/${loteId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar lote ${loteId}:`, error);
    throw error;
  }
};

// Transferir / devolver un Lote entre depósito y laboratorios (POST /lotes/:id/transferir).
// - laboratorioDestinoId: ObjectId del laboratorio destino, o null para DEVOLVER al depósito. Obligatorio.
// - cantidad (opcional): traslado PARCIAL (entero > 0). Omitida = mueve el lote completo.
// - observacion (opcional, máx 500).
// El backend deriva el tipo (DEVOLUCION si destino null, TRANSFERENCIA si no).
// Devuelve el lote resultante; en un parcial es el LOTE DESTINO nuevo (refrescar el
// listado del ítem porque el origen quedó con menos cantidad). Requiere rol PERSONAL/ADMIN.
export const transferirLote = async (loteId, { laboratorioDestinoId, cantidad, observacion } = {}) => {
  try {
    const payload = { laboratorioDestinoId: laboratorioDestinoId ?? null };
    if (cantidad != null) payload.cantidad = cantidad;
    if (observacion) payload.observacion = observacion;
    const response = await api.post(`/lotes/${loteId}/transferir`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error al transferir lote ${loteId}:`, error);
    throw error;
  }
};

// --- Servicios para la colección Equipos ---

// Obtener Equipos paginados. Devuelve { total, page, limit, equipos }.
// Requiere JWT (lo agrega el interceptor de api/axios).
export const getEquipos = async ({ q, estado, edificioId, laboratorioId, page, limit } = {}) => {
  try {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (estado) params.append("estado", estado);
    if (edificioId) params.append("edificioId", edificioId);
    if (laboratorioId) params.append("laboratorioId", laboratorioId);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const response = await api.get(`/equipo${params.toString() ? "?" + params.toString() : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener equipos:", error);
    throw error;
  }
};

export const getEquipoById = async (equipoId) => {
  try {
    const response = await api.get(`/equipo/${equipoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener equipo ${equipoId}:`, error);
    throw error;
  }
};

export const createEquipo = async (equipoData) => {
  try {
    const response = await api.post("/equipo", equipoData);
    return response.data;
  } catch (error) {
    console.error("Error al crear equipo:", error);
    throw error;
  }
};

export const updateEquipo = async (equipoId, equipoData) => {
  try {
    const response = await api.put(`/equipo/${equipoId}`, equipoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar equipo ${equipoId}:`, error);
    throw error;
  }
};

export const deleteEquipo = async (equipoId) => {
  try {
    const response = await api.delete(`/equipo/${equipoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar equipo ${equipoId}:`, error);
    throw error;
  }
};

// --- Mantenimiento de equipos (deja traza en el historial) ---

// Registrar mantenimiento: pone el equipo en "mantenimiento" y crea el registro
// de historial. Body: { tipo: "preventivo"|"correctivo", descripcion?, fecha? }.
// El responsableId lo toma el backend del JWT.
export const registrarMantenimiento = async (equipoId, data) => {
  try {
    const response = await api.post(`/equipo/${equipoId}/mantenimientos`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al registrar mantenimiento del equipo ${equipoId}:`, error);
    throw error;
  }
};

// Finalizar mantenimiento: devuelve el equipo a "disponible" y cierra el
// mantenimiento abierto. El backend fija la fecha de fin con su propia hora,
// así que el body va vacío ({}).
export const finalizarMantenimiento = async (equipoId, data = {}) => {
  try {
    const response = await api.patch(`/equipo/${equipoId}/mantenimientos/finalizar`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al finalizar mantenimiento del equipo ${equipoId}:`, error);
    throw error;
  }
};

// Historial de mantenimiento de un equipo (paginado). Ojo: shape distinto al
// resto de listados → { paginacion: { page, limit, total, totalPaginas },
// registros: [...] }. `responsableId` viene populado (o null); los registros
// van ordenados por `fecha` descendente.
export const getMantenimientos = async (equipoId, { tipo, page = 1, limit = 20 } = {}) => {
  try {
    const params = { page, limit };
    if (tipo) params.tipo = tipo;
    const { data } = await api.get(`/equipo/${equipoId}/mantenimientos`, { params });
    return data; // { paginacion, registros }
  } catch (error) {
    console.error(`Error al obtener mantenimientos del equipo ${equipoId}:`, error);
    throw error;
  }
};

// --- Helpers para consumidores que necesitan TODO el listado (no paginado) ---

// Itera las páginas de un endpoint paginado (limit=100, máximo del back) y
// devuelve un array plano con todos los registros de la clave `key`.
const fetchTodasLasPaginas = async (fetchPage, key) => {
  const primera = await fetchPage(1);
  const acumulado = [...(primera[key] || [])];
  const limit = primera.limit || 100;
  const totalPaginas = Math.ceil((primera.total || 0) / limit);
  for (let p = 2; p <= totalPaginas; p++) {
    const resp = await fetchPage(p);
    acumulado.push(...(resp[key] || []));
  }
  return acumulado;
};

// Devuelve todos los items (array plano) recorriendo todas las páginas.
export const getAllItems = (filtros = {}) =>
  fetchTodasLasPaginas((page) => getItems({ ...filtros, page, limit: 100 }), "items");

// Devuelve todos los equipos (array plano) recorriendo todas las páginas.
export const getAllEquipos = (filtros = {}) =>
  fetchTodasLasPaginas((page) => getEquipos({ ...filtros, page, limit: 100 }), "equipos");
