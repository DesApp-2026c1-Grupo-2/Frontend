import api from "../api/axios";

export const obtenerEquipos = async () => {
  const res = await api.get("/equipo");

  return res.data;
};