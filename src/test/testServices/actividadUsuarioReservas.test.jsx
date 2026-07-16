import { describe, test, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios';
import {
  getActividades,
  getActividadById,
  createActividad,
  updateActividad,
  deleteActividad,
  getSugerencias,
} from '../../services/actividadService';
import {
  obtenerUsuariosPendientes,
  obtenerUsuarios,
  aprobarUsuario,
  rechazarUsuario,
} from '../../services/usuarioService';
import { getReservasActivas, getReservasFinalizadas } from '../../services/reservas';

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const FIXTURE = { ok: true };

describe('services/actividadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getActividades lista sin filtros', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getActividades();

    expect(api.get).toHaveBeenCalledWith('/actividades', { params: {} });
    expect(resultado).toBe(FIXTURE);
  });

  test('getActividades propaga los filtros', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    await getActividades({ tipo: 'quimica' });

    expect(api.get).toHaveBeenCalledWith('/actividades', { params: { tipo: 'quimica' } });
  });

  test('getActividadById pega a la actividad indicada', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getActividadById('a1');

    expect(api.get).toHaveBeenCalledWith('/actividades/a1');
    expect(resultado).toBe(FIXTURE);
  });

  test('createActividad manda el body', async () => {
    api.post.mockResolvedValue({ data: FIXTURE });

    const resultado = await createActividad({ nombre: 'Titulación' });

    expect(api.post).toHaveBeenCalledWith('/actividades', { nombre: 'Titulación' });
    expect(resultado).toBe(FIXTURE);
  });

  test('updateActividad pega a la actividad indicada', async () => {
    api.put.mockResolvedValue({ data: FIXTURE });

    const resultado = await updateActividad('a1', { nombre: 'Nueva' });

    expect(api.put).toHaveBeenCalledWith('/actividades/a1', { nombre: 'Nueva' });
    expect(resultado).toBe(FIXTURE);
  });

  test('deleteActividad pega a la actividad indicada', async () => {
    api.delete.mockResolvedValue({ data: FIXTURE });

    const resultado = await deleteActividad('a1');

    expect(api.delete).toHaveBeenCalledWith('/actividades/a1');
    expect(resultado).toBe(FIXTURE);
  });

  test('getSugerencias pide las sugerencias de la actividad', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getSugerencias('a1');

    expect(api.get).toHaveBeenCalledWith('/actividades/a1/sugerencias');
    expect(resultado).toBe(FIXTURE);
  });

  test('propaga el error del backend', async () => {
    api.get.mockRejectedValue(new Error('Network Error'));

    await expect(getActividades()).rejects.toThrow('Network Error');
  });
});

describe('services/usuarioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const usuarios = [{ _id: 'u1' }, { _id: 'u2' }];

  test('obtenerUsuariosPendientes usa la paginación por defecto', async () => {
    api.get.mockResolvedValue({ data: { total: 2, page: 1, limit: 50, usuarios } });

    const resultado = await obtenerUsuariosPendientes();

    expect(api.get).toHaveBeenCalledWith('/usuarios/pendientes', { params: { page: 1, limit: 50 } });
    expect(resultado).toEqual({ usuarios, total: 2, page: 1, limit: 50 });
  });

  test('obtenerUsuarios acepta page y limit', async () => {
    api.get.mockResolvedValue({ data: { total: 30, page: 2, limit: 12, usuarios } });

    const resultado = await obtenerUsuarios({ page: 2, limit: 12 });

    expect(api.get).toHaveBeenCalledWith('/usuarios', { params: { page: 2, limit: 12 } });
    expect(resultado.total).toBe(30);
  });

  // El service tolera el formato viejo del backend (array plano).
  test('normaliza una respuesta que viene como array plano', async () => {
    api.get.mockResolvedValue({ data: usuarios });

    const resultado = await obtenerUsuarios();

    expect(resultado).toEqual({ usuarios, total: 2, page: 1, limit: 2 });
  });

  test('normaliza una respuesta sin metadatos de paginación', async () => {
    api.get.mockResolvedValue({ data: { usuarios } });

    const resultado = await obtenerUsuarios();

    expect(resultado).toEqual({ usuarios, total: 2, page: 1, limit: 2 });
  });

  test('normaliza una respuesta vacía', async () => {
    api.get.mockResolvedValue({ data: null });

    const resultado = await obtenerUsuarios();

    expect(resultado).toEqual({ usuarios: [], total: 0, page: 1, limit: 0 });
  });

  test('aprobarUsuario pega al endpoint sin body', async () => {
    api.patch.mockResolvedValue({ data: FIXTURE });

    const resultado = await aprobarUsuario('u1');

    expect(api.patch).toHaveBeenCalledWith('/usuarios/u1/aprobar');
    expect(resultado).toBe(FIXTURE);
  });

  test('rechazarUsuario usa el borrado lógico', async () => {
    api.delete.mockResolvedValue({ data: FIXTURE });

    const resultado = await rechazarUsuario('u1');

    expect(api.delete).toHaveBeenCalledWith('/usuarios/u1');
    expect(resultado).toBe(FIXTURE);
  });

  test('propaga el error del backend', async () => {
    api.patch.mockRejectedValue(new Error('Network Error'));

    await expect(aprobarUsuario('u1')).rejects.toThrow('Network Error');
  });
});

describe('services/reservas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getReservasActivas propaga el rango de fechas', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getReservasActivas('2026-01-01', '2026-12-31');

    expect(api.get).toHaveBeenCalledWith('/reservas/activas', {
      params: { startDate: '2026-01-01', endDate: '2026-12-31' },
    });
    expect(resultado).toBe(FIXTURE);
  });

  test('getReservasActivas omite las fechas ausentes', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    await getReservasActivas();

    expect(api.get).toHaveBeenCalledWith('/reservas/activas', { params: {} });
  });

  test('getReservasFinalizadas propaga el rango de fechas', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getReservasFinalizadas('2026-01-01', '2026-12-31');

    expect(api.get).toHaveBeenCalledWith('/reservas/finalizadas', {
      params: { startDate: '2026-01-01', endDate: '2026-12-31' },
    });
    expect(resultado).toBe(FIXTURE);
  });

  // Asimetría con getReservasActivas: acá las fechas van sin filtrar. Axios
  // igual omite las claves undefined al serializar la query.
  test('getReservasFinalizadas manda las fechas ausentes como undefined', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    await getReservasFinalizadas();

    expect(api.get).toHaveBeenCalledWith('/reservas/finalizadas', {
      params: { startDate: undefined, endDate: undefined },
    });
  });

  test('propaga el error del backend', async () => {
    api.get.mockRejectedValue(new Error('Network Error'));

    await expect(getReservasActivas()).rejects.toThrow('Network Error');
  });
});
