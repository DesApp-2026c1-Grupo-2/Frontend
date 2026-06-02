import api from "../api/axios";

/*
  =========================
  OBTENER EDIFICIOS
  =========================
*/
export const obtenerEdificios = async () => {
  const response = await api.get("/edificio");

  return response.data;
};

/*
  =========================
  CREAR EDIFICIO
  =========================
*/
export const crearEdificio = async (data) => {
  const response = await api.post("/edificio", data);

  return response.data;
};

/*
  =========================
  ACTUALIZAR EDIFICIO
  =========================
*/
export const actualizarEdificio = async (id, data) => {
  const response = await api.put(
    `/edificio/${id}`,
    data
  );

  return response.data;
};

/*
  =========================
  ELIMINAR EDIFICIO
  =========================
*/
export const eliminarEdificio = async (id) => {
  const response = await api.delete(
    `/edificio/${id}`
  );

  return response.data;
};