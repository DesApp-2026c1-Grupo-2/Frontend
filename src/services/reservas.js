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