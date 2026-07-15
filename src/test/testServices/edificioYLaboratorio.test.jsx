import { describe, test, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios';
import {
  obtenerEdificios,
  crearEdificio,
  actualizarEdificio,
  eliminarEdificio,
} from '../../services/edificioService';
import {
  obtenerLaboratoriosPorEdificio,
  crearLaboratorio,
  actualizarEstadoLaboratorio,
  eliminarLaboratorio,
} from '../../services/laboratorioService';

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

describe('services/edificioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('obtenerEdificios lista los edificios', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await obtenerEdificios();

    expect(api.get).toHaveBeenCalledWith('/edificio');
    expect(resultado).toBe(FIXTURE);
  });

  test('crearEdificio manda el body al endpoint', async () => {
    api.post.mockResolvedValue({ data: FIXTURE });

    const resultado = await crearEdificio({ nombre: 'Edificio A' });

    expect(api.post).toHaveBeenCalledWith('/edificio', { nombre: 'Edificio A' });
    expect(resultado).toBe(FIXTURE);
  });

  test('actualizarEdificio pega al edificio indicado', async () => {
    api.put.mockResolvedValue({ data: FIXTURE });

    const resultado = await actualizarEdificio('ed-1', { nombre: 'Nuevo' });

    expect(api.put).toHaveBeenCalledWith('/edificio/ed-1', { nombre: 'Nuevo' });
    expect(resultado).toBe(FIXTURE);
  });

  test('eliminarEdificio pega al edificio indicado', async () => {
    api.delete.mockResolvedValue({ data: FIXTURE });

    const resultado = await eliminarEdificio('ed-1');

    expect(api.delete).toHaveBeenCalledWith('/edificio/ed-1');
    expect(resultado).toBe(FIXTURE);
  });

  test('propaga el error del backend', async () => {
    api.get.mockRejectedValue(new Error('Network Error'));

    await expect(obtenerEdificios()).rejects.toThrow('Network Error');
  });
});

describe('services/laboratorioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('obtenerLaboratoriosPorEdificio filtra por edificio', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await obtenerLaboratoriosPorEdificio('ed-1');

    expect(api.get).toHaveBeenCalledWith('/laboratorio/edificio/ed-1');
    expect(resultado).toBe(FIXTURE);
  });

  test('crearLaboratorio manda el body al endpoint', async () => {
    api.post.mockResolvedValue({ data: FIXTURE });

    const resultado = await crearLaboratorio({ nombre: 'Lab 1' });

    expect(api.post).toHaveBeenCalledWith('/laboratorio', { nombre: 'Lab 1' });
    expect(resultado).toBe(FIXTURE);
  });

  test('actualizarEstadoLaboratorio envuelve el estado en el body', async () => {
    api.patch.mockResolvedValue({ data: FIXTURE });

    const resultado = await actualizarEstadoLaboratorio('lab-1', 'mantenimiento');

    expect(api.patch).toHaveBeenCalledWith('/laboratorio/lab-1/estado', { estado: 'mantenimiento' });
    expect(resultado).toBe(FIXTURE);
  });

  test('eliminarLaboratorio pega al laboratorio indicado', async () => {
    api.delete.mockResolvedValue({ data: FIXTURE });

    const resultado = await eliminarLaboratorio('lab-1');

    expect(api.delete).toHaveBeenCalledWith('/laboratorio/lab-1');
    expect(resultado).toBe(FIXTURE);
  });

  test('propaga el error del backend', async () => {
    api.post.mockRejectedValue(new Error('Network Error'));

    await expect(crearLaboratorio({})).rejects.toThrow('Network Error');
  });
});
