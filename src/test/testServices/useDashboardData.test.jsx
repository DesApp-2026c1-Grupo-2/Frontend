import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios';
import {
  usePedidos,
  useEquipamiento,
  useUsoEquipos,
  useMateriales,
} from '../../services/useDashboardData';
import { getAllItems, getAllEquipos, getEstadisticasUso } from '../../services/equipamiento';

vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }));

// Se mockea el service y no axios: getAllEquipos/getAllItems paginan solos y
// emular esa paginación acá haría los fixtures frágiles.
vi.mock('../../services/equipamiento', () => ({
  getAllItems: vi.fn(),
  getAllEquipos: vi.fn(),
  getEstadisticasUso: vi.fn(),
}));

describe('usePedidos', () => {
  beforeEach(() => vi.clearAllMocks());

  test('arranca cargando y expone los pedidos', async () => {
    const pedidos = [{ _id: 'p-1' }];
    api.get.mockResolvedValue({ data: pedidos });

    const { result } = renderHook(() => usePedidos());

    expect(result.current.loading).toBe(true);
    expect(result.current.pedidos).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(api.get).toHaveBeenCalledWith('/pedido');
    expect(result.current.pedidos).toBe(pedidos);
    expect(result.current.error).toBeNull();
  });

  test('expone el error si falla', async () => {
    const error = new Error('Network Error');
    api.get.mockRejectedValue(error);

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(error);
    expect(result.current.pedidos).toEqual([]);
  });
});

describe('useEquipamiento', () => {
  beforeEach(() => vi.clearAllMocks());

  test('expone los equipos', async () => {
    const equipos = [{ _id: 'eq-1' }];
    getAllEquipos.mockResolvedValue(equipos);

    const { result } = renderHook(() => useEquipamiento());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.equipamiento).toBe(equipos);
  });

  test('expone el error si falla', async () => {
    const error = new Error('Network Error');
    getAllEquipos.mockRejectedValue(error);

    const { result } = renderHook(() => useEquipamiento());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(error);
  });
});

describe('useMateriales', () => {
  beforeEach(() => vi.clearAllMocks());

  test('pide solo materiales y normaliza el stock', async () => {
    getAllItems.mockResolvedValue([
      { _id: 'i-1', stockDisponible: 7 },
      { _id: 'i-2' }, // sin stockDisponible
    ]);

    const { result } = renderHook(() => useMateriales());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAllItems).toHaveBeenCalledWith({ tipo: 'material' });
    expect(result.current.materiales[0].stock).toBe(7);
    // Sin stockDisponible el stock queda en 0, no undefined.
    expect(result.current.materiales[1].stock).toBe(0);
  });

  test('expone el error si falla', async () => {
    const error = new Error('Network Error');
    getAllItems.mockRejectedValue(error);

    const { result } = renderHook(() => useMateriales());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(error);
  });
});

describe('useUsoEquipos', () => {
  beforeEach(() => vi.clearAllMocks());

  test('consulta el período por defecto', async () => {
    getEstadisticasUso.mockResolvedValue({
      equipos: [{ equipoId: 'eq-1', usos: 3 }],
      desde: '2026-05-01',
      hasta: '2026-05-07',
      paginacion: { total: 1 },
    });

    const { result } = renderHook(() => useUsoEquipos());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getEstadisticasUso).toHaveBeenCalledWith({ periodo: 'semana', limit: 100 });
    expect(result.current.estadisticas.equipos).toHaveLength(1);
    expect(result.current.estadisticas.desde).toBe('2026-05-01');
  });

  test('completa los campos que el backend no devuelve', async () => {
    getEstadisticasUso.mockResolvedValue({});

    const { result } = renderHook(() => useUsoEquipos('mes'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.estadisticas).toEqual({
      equipos: [],
      desde: null,
      hasta: null,
      paginacion: {},
    });
  });

  test('con enabled en false no consulta y no queda cargando', async () => {
    const { result } = renderHook(() => useUsoEquipos('semana', { enabled: false }));

    // El loading inicial sigue a `enabled`, no arranca siempre en true.
    expect(result.current.loading).toBe(false);
    await waitFor(() => expect(getEstadisticasUso).not.toHaveBeenCalled());
  });

  test('vuelve a consultar al cambiar el período', async () => {
    getEstadisticasUso.mockResolvedValue({ equipos: [] });

    const { result, rerender } = renderHook(({ periodo }) => useUsoEquipos(periodo), {
      initialProps: { periodo: 'semana' },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ periodo: 'mes' });

    await waitFor(() => expect(getEstadisticasUso).toHaveBeenLastCalledWith({ periodo: 'mes', limit: 100 }));
    expect(getEstadisticasUso).toHaveBeenCalledTimes(2);
  });

  test('expone el error si falla', async () => {
    const error = new Error('Network Error');
    getEstadisticasUso.mockRejectedValue(error);

    const { result } = renderHook(() => useUsoEquipos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(error);
  });

  test('descartar el hook antes de que responda no actualiza el estado', async () => {
    let resolver;
    getEstadisticasUso.mockReturnValue(new Promise((r) => { resolver = r; }));

    const { result, unmount } = renderHook(() => useUsoEquipos());
    unmount();

    resolver({ equipos: [{ equipoId: 'eq-1' }] });

    // El flag `cancelado` evita el setState tardío: sigue en el estado inicial.
    await waitFor(() => expect(result.current.estadisticas.equipos).toEqual([]));
  });
});
