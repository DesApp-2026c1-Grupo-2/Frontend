import api from "../api/axios";

export const getReservasActivas = async (startDate, endDate) => {
  const params = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const { data } = await api.get("/reservas/activas", {
    params,
  });

  return data;
};

export const getReservasFinalizadas = async (startDate, endDate) => {
  const { data } = await api.get("/reservas/finalizadas", {
    params: {
      startDate,
      endDate,
    },
  });

  return data;
};

// Detalle de la reserva de un pedido: qué consumibles hay que reportar al finalizar.
// Un 404 significa que el pedido no tiene reserva asociada (nunca fue aprobado),
// que no es un error sino "no hay nada que reportar".
export const getReservaPorPedido = async (pedidoId) => {
  try {
    const { data } = await api.get(`/reservas/pedido/${pedidoId}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    console.error(`Error al obtener la reserva del pedido ${pedidoId}:`, error);
    throw error;
  }
};