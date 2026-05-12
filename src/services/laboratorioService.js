import api from "../api/axios";

export const obtenerLaboratoriosPorEdificio = async (id) => {
  const res = await api.get(`/laboratorio/edificio/${id}`);
  return res.data;
};

export const crearLaboratorio = async (data) => {
  const res = await api.post("/laboratorio", data);
  return res.data;
};