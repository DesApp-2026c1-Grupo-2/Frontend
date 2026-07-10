import api from "../api/axios.js";

export const getActividades = (params = {}) =>
  api.get("/actividades", { params }).then((r) => r.data);

export const getActividadById = (id) =>
  api.get(`/actividades/${id}`).then((r) => r.data);

export const createActividad = (data) =>
  api.post("/actividades", data).then((r) => r.data);

export const updateActividad = (id, data) =>
  api.put(`/actividades/${id}`, data).then((r) => r.data);

export const deleteActividad = (id) =>
  api.delete(`/actividades/${id}`).then((r) => r.data);

export const getSugerencias = (id) =>
  api.get(`/actividades/${id}/sugerencias`).then((r) => r.data);
