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