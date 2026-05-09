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