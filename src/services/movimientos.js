import api from "../api/axios";

// Servicio del Historial de Movimientos de Stock.
//
// Colección única que registra TODO cambio de stock físico del inventario
// (consumos, descartes de reutilizables, altas/ajustes/bajas de lote,
// devoluciones, transferencias, mantenimiento). Cada movimiento cumple el
// invariante `cantidadNueva = cantidadAnterior + cantidad`, con `cantidad`
// SIGNADA (negativa = egreso, positiva = ingreso). `cantidadAnterior` y
// `cantidadNueva` son el stock físico agregado del item (suma de sus lotes).
//
// Contrato del backend (requieren `Authorization: Bearer <JWT>`):
//
//   GET /movimientos            → listado global paginado
//     query (todos opcionales, se combinan con AND): itemId, tipoMovimiento
//       (APROBACION_RESERVA|DESCARTE|COMPRA|AJUSTE_MANUAL|BAJA|DEVOLUCION|
//       TRANSFERENCIA|MANTENIMIENTO), reservaId, laboratorioId (matchea origen
//       O destino), desde, hasta (fecha ISO), page (default 1), limit
//       (default 50, máx 200)
//     respuesta: { total, page, limit, movimientos: [ ...poblado con item,
//       usuario y laboratorios origen/destino... ] }
//
//   GET /movimientos/item/:id   → movimientos de un item puntual (paginado)
//     query: page, limit
//
// Notas: `usuarioId` puede venir null (movimientos de sistema, p. ej. el cron
// de consumo). `origen/destinoLaboratorioId` pueden venir null. Ordenados por
// `createdAt` descendente. Como en descartes, `hasta` usa $lte: para incluir el
// día completo conviene enviar `YYYY-MM-DDT23:59:59Z`.

// Listado global paginado con filtros.
export const getMovimientos = async ({
  itemId,
  tipoMovimiento,
  reservaId,
  laboratorioId,
  desde,
  hasta,
  page = 1,
  limit = 50,
} = {}) => {
  try {
    const params = { page, limit };
    if (itemId) params.itemId = itemId;
    if (tipoMovimiento) params.tipoMovimiento = tipoMovimiento;
    if (reservaId) params.reservaId = reservaId;
    if (laboratorioId) params.laboratorioId = laboratorioId;
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    const { data } = await api.get("/movimientos", { params });
    return data; // { total, page, limit, movimientos }
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    throw error;
  }
};

// Movimientos de un item puntual (paginado).
export const getMovimientosPorItem = async (itemId, page = 1, limit = 50) => {
  try {
    const { data } = await api.get(`/movimientos/item/${itemId}`, {
      params: { page, limit },
    });
    return data; // { total, page, limit, movimientos }
  } catch (error) {
    console.error(`Error al obtener movimientos del item ${itemId}:`, error);
    throw error;
  }
};
