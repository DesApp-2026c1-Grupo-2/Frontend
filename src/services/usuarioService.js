import api from "../api/axios";

/*
  =========================
  NORMALIZAR RESPUESTA PAGINADA
  =========================
  El backend devuelve { total, page, limit, usuarios: [...] }. Este helper
  tolera además el formato viejo (array plano) por si algún endpoint no
  estuviera migrado, devolviendo siempre la misma forma.
*/
const normalizarPaginado = (data) => {
  if (Array.isArray(data)) {
    return { usuarios: data, total: data.length, page: 1, limit: data.length };
  }
  const usuarios = data?.usuarios || [];
  return {
    usuarios,
    total: data?.total ?? usuarios.length,
    page: data?.page ?? 1,
    limit: data?.limit ?? usuarios.length,
  };
};

/*
  =========================
  LISTAR USUARIOS PENDIENTES
  =========================
  Núcleo del dashboard: usuarios con estado PENDIENTE y activo !== false.
  Devuelve { total, page, limit, usuarios }.
*/
export const obtenerUsuariosPendientes = async ({ page = 1, limit = 50 } = {}) => {
  const response = await api.get("/usuarios/pendientes", {
    params: { page, limit },
  });

  return normalizarPaginado(response.data);
};

/*
  =========================
  LISTAR TODOS LOS USUARIOS
  =========================
  Padrón completo (paginado). Devuelve { total, page, limit, usuarios }.
*/
export const obtenerUsuarios = async ({ page = 1, limit = 50 } = {}) => {
  const response = await api.get("/usuarios", {
    params: { page, limit },
  });

  return normalizarPaginado(response.data);
};

/*
  =========================
  APROBAR USUARIO
  =========================
  Cambia el estado de PENDIENTE a ACTIVO y dispara el correo de
  notificación en el backend. No requiere body.
*/
export const aprobarUsuario = async (id) => {
  const response = await api.patch(`/usuarios/${id}/aprobar`);

  return response.data;
};

/*
  =========================
  RECHAZAR USUARIO
  =========================
  No existe un endpoint de rechazo dedicado: se usa el borrado lógico
  (activo: false), con lo cual el usuario desaparece de los listados.
*/
export const rechazarUsuario = async (id) => {
  const response = await api.delete(`/usuarios/${id}`);

  return response.data;
};
