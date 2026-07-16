import { describe, test, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios';
import {
  getItems,
  getEstadisticasItems,
  getEstadisticasUso,
  getItemById,
  getStockItem,
  getLotes,
  getLotesByItemId,
  getLoteById,
  createItem,
  createLote,
  updateItem,
  updateLote,
  deleteItem,
  deleteLote,
  transferirLote,
  getEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  registrarMantenimiento,
  finalizarMantenimiento,
  getMantenimientos,
  getAllItems,
  getAllEquipos,
} from '../../services/equipamiento';

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

describe('services/equipamiento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Todas las funciones loguean el error antes de re-lanzarlo.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Cada entrada: [nombre, invocación, método de axios, url esperada]
  const wrappers = [
    ['getItemById', () => getItemById('i1'), 'get', '/items/i1'],
    ['getLoteById', () => getLoteById('l1'), 'get', '/lotes/l1'],
    ['getLotesByItemId', () => getLotesByItemId('i1'), 'get', '/lotes?itemId=i1'],
    ['getEstadisticasItems', () => getEstadisticasItems(), 'get', '/items/estadisticas'],
    ['getEquipoById', () => getEquipoById('e1'), 'get', '/equipo/e1'],
    ['createItem', () => createItem({ nombre: 'X' }), 'post', '/items'],
    ['createEquipo', () => createEquipo({ nombre: 'E' }), 'post', '/equipo'],
    ['updateItem', () => updateItem('i1', { a: 1 }), 'put', '/items/i1'],
    ['updateEquipo', () => updateEquipo('e1', { a: 1 }), 'put', '/equipo/e1'],
    ['deleteItem', () => deleteItem('i1'), 'delete', '/items/i1'],
    ['deleteLote', () => deleteLote('l1'), 'delete', '/lotes/l1'],
    ['deleteEquipo', () => deleteEquipo('e1'), 'delete', '/equipo/e1'],
    ['registrarMantenimiento', () => registrarMantenimiento('e1', { tipo: 'preventivo' }), 'post', '/equipo/e1/mantenimientos'],
    ['finalizarMantenimiento', () => finalizarMantenimiento('e1'), 'patch', '/equipo/e1/mantenimientos/finalizar'],
  ];

  describe('wrappers simples', () => {
    test.each(wrappers)('%s pega al endpoint correcto y devuelve data', async (_nombre, invocar, metodo, url) => {
      api[metodo].mockResolvedValue({ data: FIXTURE });

      const resultado = await invocar();

      // Solo la URL: algunos wrappers mandan body y otros no.
      expect(api[metodo]).toHaveBeenCalledTimes(1);
      expect(api[metodo].mock.calls[0][0]).toBe(url);
      expect(resultado).toBe(FIXTURE);
    });

    test.each(wrappers)('%s propaga el error del backend', async (_nombre, invocar, metodo) => {
      const error = new Error('Network Error');
      api[metodo].mockRejectedValue(error);

      await expect(invocar()).rejects.toThrow('Network Error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('construcción de query strings', () => {
    test('getItems sin argumentos no agrega el signo de pregunta', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getItems();

      expect(api.get).toHaveBeenCalledWith('/items');
    });

    test('getItems arma la query con todos los filtros', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getItems({ q: 'alc', tipo: 'material', page: 2, limit: 20, sort: 'nombre', order: 'asc' });

      expect(api.get).toHaveBeenCalledWith('/items?q=alc&tipo=material&page=2&limit=20&sort=nombre&order=asc');
    });

    test('getItems manda esConsumible=false (no lo trata como ausente)', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getItems({ esConsumible: false });

      expect(api.get).toHaveBeenCalledWith('/items?esConsumible=false');
    });

    test('getEquipos arma la query con todos los filtros', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getEquipos({ q: 'micro', estado: 'disponible', edificioId: 'ed1', laboratorioId: 'lab1', page: 1, limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/equipo?q=micro&estado=disponible&edificioId=ed1&laboratorioId=lab1&page=1&limit=10');
    });

    test('getEquipos sin argumentos pega al endpoint pelado', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getEquipos();

      expect(api.get).toHaveBeenCalledWith('/equipo');
    });

    test('getLotes con paginación arma la query', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getLotes({ itemId: 'i1', estado: 'disponible', page: 1, limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/lotes?itemId=i1&estado=disponible&page=1&limit=10');
    });

    test('getLotes sin argumentos pega al endpoint pelado', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getLotes();

      expect(api.get).toHaveBeenCalledWith('/lotes');
    });

    test('getEstadisticasUso serializa una fecha Date a ISO', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getEstadisticasUso({ periodo: 'mes', fecha: new Date('2026-01-01T00:00:00.000Z') });

      expect(api.get).toHaveBeenCalledWith('/equipo/estadisticas-uso?periodo=mes&fecha=2026-01-01T00%3A00%3A00.000Z');
    });

    test('getEstadisticasUso deja pasar una fecha string tal cual', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getEstadisticasUso({ fecha: '2026-01-01', laboratorioId: 'lab1', equipoId: 'eq1', page: 2, limit: 5 });

      expect(api.get).toHaveBeenCalledWith('/equipo/estadisticas-uso?fecha=2026-01-01&laboratorioId=lab1&equipoId=eq1&page=2&limit=5');
    });

    test('getEstadisticasUso sin argumentos pega al endpoint pelado', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getEstadisticasUso();

      expect(api.get).toHaveBeenCalledWith('/equipo/estadisticas-uso');
    });
  });

  describe('endpoints que usan params de axios en vez de query string', () => {
    test('getStockItem sin ventana temporal manda params vacío', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      const resultado = await getStockItem('i1');

      expect(api.get).toHaveBeenCalledWith('/items/i1/stock', { params: {} });
      expect(resultado).toBe(FIXTURE);
    });

    test('getStockItem propaga desde/hasta', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getStockItem('i1', { desde: '2026-01-01', hasta: '2026-01-31' });

      expect(api.get).toHaveBeenCalledWith('/items/i1/stock', {
        params: { desde: '2026-01-01', hasta: '2026-01-31' },
      });
    });

    test('getStockItem propaga el error', async () => {
      api.get.mockRejectedValue(new Error('boom'));

      await expect(getStockItem('i1')).rejects.toThrow('boom');
    });

    test('getMantenimientos aplica page y limit por defecto', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      const resultado = await getMantenimientos('e1');

      expect(api.get).toHaveBeenCalledWith('/equipo/e1/mantenimientos', { params: { page: 1, limit: 20 } });
      expect(resultado).toBe(FIXTURE);
    });

    test('getMantenimientos incluye el filtro por tipo', async () => {
      api.get.mockResolvedValue({ data: FIXTURE });

      await getMantenimientos('e1', { tipo: 'preventivo', page: 3, limit: 5 });

      expect(api.get).toHaveBeenCalledWith('/equipo/e1/mantenimientos', {
        params: { page: 3, limit: 5, tipo: 'preventivo' },
      });
    });

    test('getMantenimientos propaga el error', async () => {
      api.get.mockRejectedValue(new Error('boom'));

      await expect(getMantenimientos('e1')).rejects.toThrow('boom');
    });
  });

  describe('normalización de movilidad en lotes', () => {
    test('createLote agrega movilidad "Fija" por defecto', async () => {
      api.post.mockResolvedValue({ data: FIXTURE });

      await createLote({ cantidad: 5 });

      expect(api.post).toHaveBeenCalledWith('/lotes', { cantidad: 5, movilidad: 'Fija' });
    });

    test('createLote respeta la movilidad explícita', async () => {
      api.post.mockResolvedValue({ data: FIXTURE });

      await createLote({ cantidad: 5, movilidad: 'Movible' });

      expect(api.post).toHaveBeenCalledWith('/lotes', { cantidad: 5, movilidad: 'Movible' });
    });

    test('createLote propaga el error', async () => {
      api.post.mockRejectedValue(new Error('boom'));

      await expect(createLote({})).rejects.toThrow('boom');
    });

    test('updateLote agrega movilidad "Fija" por defecto', async () => {
      api.put.mockResolvedValue({ data: FIXTURE });

      await updateLote('l1', { cantidad: 2 });

      expect(api.put).toHaveBeenCalledWith('/lotes/l1', { cantidad: 2, movilidad: 'Fija' });
    });

    test('updateLote respeta la movilidad explícita', async () => {
      api.put.mockResolvedValue({ data: FIXTURE });

      await updateLote('l1', { movilidad: 'Movible' });

      expect(api.put).toHaveBeenCalledWith('/lotes/l1', { movilidad: 'Movible' });
    });

    test('updateLote propaga el error', async () => {
      api.put.mockRejectedValue(new Error('boom'));

      await expect(updateLote('l1', {})).rejects.toThrow('boom');
    });
  });

  describe('transferirLote', () => {
    test('sin argumentos devuelve el lote al depósito (destino null)', async () => {
      api.post.mockResolvedValue({ data: FIXTURE });

      await transferirLote('l1');

      expect(api.post).toHaveBeenCalledWith('/lotes/l1/transferir', { laboratorioDestinoId: null });
    });

    test('con laboratorio destino no incluye cantidad ni observación', async () => {
      api.post.mockResolvedValue({ data: FIXTURE });

      await transferirLote('l1', { laboratorioDestinoId: 'lab1' });

      expect(api.post).toHaveBeenCalledWith('/lotes/l1/transferir', { laboratorioDestinoId: 'lab1' });
    });

    test('un traslado parcial incluye la cantidad', async () => {
      api.post.mockResolvedValue({ data: FIXTURE });

      await transferirLote('l1', { laboratorioDestinoId: 'lab1', cantidad: 3 });

      expect(api.post).toHaveBeenCalledWith('/lotes/l1/transferir', {
        laboratorioDestinoId: 'lab1',
        cantidad: 3,
      });
    });

    test('incluye la observación cuando se pasa', async () => {
      api.post.mockResolvedValue({ data: FIXTURE });

      await transferirLote('l1', { laboratorioDestinoId: 'lab1', observacion: 'traslado por obra' });

      expect(api.post).toHaveBeenCalledWith('/lotes/l1/transferir', {
        laboratorioDestinoId: 'lab1',
        observacion: 'traslado por obra',
      });
    });

    test('propaga el error', async () => {
      api.post.mockRejectedValue(new Error('boom'));

      await expect(transferirLote('l1')).rejects.toThrow('boom');
    });
  });

  describe('getAllItems / getAllEquipos (paginación completa)', () => {
    test('con una sola página hace una única llamada', async () => {
      api.get.mockResolvedValue({ data: { total: 2, limit: 100, items: [{ id: 'i1' }, { id: 'i2' }] } });

      const resultado = await getAllItems();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/items?page=1&limit=100');
      expect(resultado).toEqual([{ id: 'i1' }, { id: 'i2' }]);
    });

    test('recorre todas las páginas y concatena los resultados', async () => {
      api.get
        .mockResolvedValueOnce({ data: { total: 250, limit: 100, items: [{ id: 'a' }] } })
        .mockResolvedValueOnce({ data: { total: 250, limit: 100, items: [{ id: 'b' }] } })
        .mockResolvedValueOnce({ data: { total: 250, limit: 100, items: [{ id: 'c' }] } });

      const resultado = await getAllItems();

      // 250 registros / 100 por página = 3 páginas.
      expect(api.get).toHaveBeenCalledTimes(3);
      expect(api.get).toHaveBeenNthCalledWith(1, '/items?page=1&limit=100');
      expect(api.get).toHaveBeenNthCalledWith(2, '/items?page=2&limit=100');
      expect(api.get).toHaveBeenNthCalledWith(3, '/items?page=3&limit=100');
      expect(resultado).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    });

    test('propaga los filtros a cada página', async () => {
      api.get.mockResolvedValue({ data: { total: 1, limit: 100, items: [] } });

      await getAllItems({ tipo: 'material' });

      expect(api.get).toHaveBeenCalledWith('/items?tipo=material&page=1&limit=100');
    });

    test('devuelve un array vacío si la respuesta no trae la clave esperada', async () => {
      api.get.mockResolvedValue({ data: { total: 0 } });

      const resultado = await getAllItems();

      expect(resultado).toEqual([]);
    });

    test('sin total no intenta pedir páginas extra', async () => {
      api.get.mockResolvedValue({ data: { items: [{ id: 'i1' }] } });

      const resultado = await getAllItems();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual([{ id: 'i1' }]);
    });

    test('getAllEquipos usa la clave equipos y pagina igual', async () => {
      api.get
        .mockResolvedValueOnce({ data: { total: 150, limit: 100, equipos: [{ id: 'e1' }] } })
        .mockResolvedValueOnce({ data: { total: 150, limit: 100, equipos: [{ id: 'e2' }] } });

      const resultado = await getAllEquipos();

      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenNthCalledWith(1, '/equipo?page=1&limit=100');
      expect(resultado).toEqual([{ id: 'e1' }, { id: 'e2' }]);
    });
  });
});
