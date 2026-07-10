import api from "../api/axios";

// Servicio del Historial de Descartes.
//
// Contrato del backend (todos los GET requieren rol PERSONAL o ADMIN; un
// DOCENTE recibe 403):
//
//   GET /descartes            → listado global paginado
//     query (todos opcionales): tipo (material|reactivo|equipo), itemId,
//       equipoId, pedidoId, reservaId, usuarioId, desde, hasta (fecha ISO),
//       page (default 1), limit (default 50, máx 200)
//     respuesta: { total, page, limit, descartes: [ ...poblado con item,
//       equipo, usuario y pedido... ] }
//
//   GET /descartes/item/:id   → descartes de un item o equipo (array plano)
//   GET /descartes/pedido/:id → descartes de un pedido (array plano)
//   POST /descartes/pedidos/:id → registrar un descarte
//   DELETE /descartes/:id       → revertir (y eliminar) un descarte
//
// Nota de fechas: `hasta` usa $lte sobre el instante exacto; para incluir el
// día completo conviene enviar `YYYY-MM-DDT23:59:59Z`. La API valida que
// `hasta` no sea anterior a `desde` (400 con detalle).

// Listado global paginado con filtros.
export const getDescartes = async ({
  tipo,
  itemId,
  equipoId,
  pedidoId,
  reservaId,
  usuarioId,
  desde,
  hasta,
  page = 1,
  limit = 50,
} = {}) => {
  try {
    const params = { page, limit };
    if (tipo) params.tipo = tipo;
    if (itemId) params.itemId = itemId;
    if (equipoId) params.equipoId = equipoId;
    if (pedidoId) params.pedidoId = pedidoId;
    if (reservaId) params.reservaId = reservaId;
    if (usuarioId) params.usuarioId = usuarioId;
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    const { data } = await api.get("/descartes", { params });
    return data; // { total, page, limit, descartes }
  } catch (error) {
    console.error("Error al obtener descartes:", error);
    throw error;
  }
};

// Descartes de un item o equipo puntual (array plano).
export const getDescartesPorItem = async (itemOEquipoId) => {
  try {
    const { data } = await api.get(`/descartes/item/${itemOEquipoId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener descartes del item ${itemOEquipoId}:`, error);
    throw error;
  }
};

// Descartes de un pedido (array plano).
export const getDescartesPorPedido = async (pedidoId) => {
  try {
    const { data } = await api.get(`/descartes/pedido/${pedidoId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener descartes del pedido ${pedidoId}:`, error);
    throw error;
  }
};

// Registrar un descarte para un pedido.
export const registrarDescarte = async (pedidoId, payload) => {
  try {
    const { data } = await api.post(`/descartes/pedidos/${pedidoId}`, payload);
    return data.descarte;
  } catch (error) {
    console.error(`Error al registrar descarte del pedido ${pedidoId}:`, error);
    throw error;
  }
};

// Revertir (y eliminar) un descarte.
export const revertirDescarte = async (descarteId) => {
  try {
    const { data } = await api.delete(`/descartes/${descarteId}`);
    return data.message;
  } catch (error) {
    console.error(`Error al revertir descarte ${descarteId}:`, error);
    throw error;
  }
};
