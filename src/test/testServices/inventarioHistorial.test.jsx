import { describe, test, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios';
import {
  getDescartes,
  getDescartesPorItem,
  getDescartesPorPedido,
  registrarDescarte,
  revertirDescarte,
} from '../../services/descartes';
import { getMovimientos, getMovimientosPorItem } from '../../services/movimientos';

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const FIXTURE = { ok: true };

describe('services/descartes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Todas las funciones loguean el error antes de re-lanzarlo.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('getDescartes usa page y limit por defecto', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getDescartes();

    expect(api.get).toHaveBeenCalledWith('/descartes', { params: { page: 1, limit: 50 } });
    expect(resultado).toBe(FIXTURE);
  });

  test('getDescartes agrega todos los filtros presentes', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    await getDescartes({
      tipo: 'material',
      itemId: 'i1',
      equipoId: 'e1',
      pedidoId: 'p1',
      reservaId: 'r1',
      usuarioId: 'u1',
      desde: '2026-01-01',
      hasta: '2026-01-31T23:59:59Z',
      page: 2,
      limit: 20,
    });

    expect(api.get).toHaveBeenCalledWith('/descartes', {
      params: {
        page: 2,
        limit: 20,
        tipo: 'material',
        itemId: 'i1',
        equipoId: 'e1',
        pedidoId: 'p1',
        reservaId: 'r1',
        usuarioId: 'u1',
        desde: '2026-01-01',
        hasta: '2026-01-31T23:59:59Z',
      },
    });
  });

  test('getDescartes omite los filtros vacíos', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    await getDescartes({ tipo: '', itemId: undefined });

    expect(api.get).toHaveBeenCalledWith('/descartes', { params: { page: 1, limit: 50 } });
  });

  test('getDescartesPorItem pega al item indicado', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getDescartesPorItem('i1');

    expect(api.get).toHaveBeenCalledWith('/descartes/item/i1');
    expect(resultado).toBe(FIXTURE);
  });

  test('getDescartesPorPedido pega al pedido indicado', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getDescartesPorPedido('p1');

    expect(api.get).toHaveBeenCalledWith('/descartes/pedido/p1');
    expect(resultado).toBe(FIXTURE);
  });

  test('registrarDescarte devuelve el descarte de adentro de la respuesta', async () => {
    const descarte = { _id: 'd1' };
    api.post.mockResolvedValue({ data: { descarte } });

    const resultado = await registrarDescarte('p1', { cantidad: 2 });

    expect(api.post).toHaveBeenCalledWith('/descartes/pedidos/p1', { cantidad: 2 });
    expect(resultado).toBe(descarte);
  });

  test('revertirDescarte devuelve el mensaje de la respuesta', async () => {
    api.delete.mockResolvedValue({ data: { message: 'Descarte revertido' } });

    const resultado = await revertirDescarte('d1');

    expect(api.delete).toHaveBeenCalledWith('/descartes/d1');
    expect(resultado).toBe('Descarte revertido');
  });

  test.each([
    ['getDescartes', () => getDescartes(), 'get'],
    ['getDescartesPorItem', () => getDescartesPorItem('i1'), 'get'],
    ['getDescartesPorPedido', () => getDescartesPorPedido('p1'), 'get'],
    ['registrarDescarte', () => registrarDescarte('p1', {}), 'post'],
    ['revertirDescarte', () => revertirDescarte('d1'), 'delete'],
  ])('%s propaga el error del backend', async (_nombre, invocar, metodo) => {
    api[metodo].mockRejectedValue(new Error('Network Error'));

    await expect(invocar()).rejects.toThrow('Network Error');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('services/movimientos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('getMovimientos usa page y limit por defecto', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getMovimientos();

    expect(api.get).toHaveBeenCalledWith('/movimientos', { params: { page: 1, limit: 50 } });
    expect(resultado).toBe(FIXTURE);
  });

  test('getMovimientos agrega todos los filtros presentes', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    await getMovimientos({
      itemId: 'i1',
      tipoMovimiento: 'DESCARTE',
      reservaId: 'r1',
      laboratorioId: 'lab1',
      desde: '2026-01-01',
      hasta: '2026-01-31T23:59:59Z',
      page: 3,
      limit: 20,
    });

    expect(api.get).toHaveBeenCalledWith('/movimientos', {
      params: {
        page: 3,
        limit: 20,
        itemId: 'i1',
        tipoMovimiento: 'DESCARTE',
        reservaId: 'r1',
        laboratorioId: 'lab1',
        desde: '2026-01-01',
        hasta: '2026-01-31T23:59:59Z',
      },
    });
  });

  test('getMovimientos omite los filtros vacíos', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    await getMovimientos({ tipoMovimiento: undefined, laboratorioId: '' });

    expect(api.get).toHaveBeenCalledWith('/movimientos', { params: { page: 1, limit: 50 } });
  });

  test('getMovimientosPorItem toma la paginación por argumentos posicionales', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    const resultado = await getMovimientosPorItem('i1');

    expect(api.get).toHaveBeenCalledWith('/movimientos/item/i1', { params: { page: 1, limit: 50 } });
    expect(resultado).toBe(FIXTURE);
  });

  test('getMovimientosPorItem acepta page y limit explícitos', async () => {
    api.get.mockResolvedValue({ data: FIXTURE });

    await getMovimientosPorItem('i1', 2, 10);

    expect(api.get).toHaveBeenCalledWith('/movimientos/item/i1', { params: { page: 2, limit: 10 } });
  });

  test.each([
    ['getMovimientos', () => getMovimientos()],
    ['getMovimientosPorItem', () => getMovimientosPorItem('i1')],
  ])('%s propaga el error del backend', async (_nombre, invocar) => {
    api.get.mockRejectedValue(new Error('Network Error'));

    await expect(invocar()).rejects.toThrow('Network Error');
    expect(console.error).toHaveBeenCalled();
  });
});
