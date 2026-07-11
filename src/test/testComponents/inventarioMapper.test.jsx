import { describe, test, expect } from 'vitest';
import {
  mapearItemsBackend,
  mapearLoteBackend,
  tipoToCategoria,
  categoriaATipoItem,
} from '../../utils/inventarioMapper';

describe('mapearItemsBackend', () => {
  test('mapea el stockDisponible del backend y normaliza id/_id', () => {
    const [conId] = mapearItemsBackend([
      { id: 'a1', nombre: 'Alcohol', tipo: 'material', codigo: 'MT-001', unidad: 'ml', esConsumible: true, stockDisponible: 250 },
    ]);
    expect(conId).toMatchObject({
      id: 'a1', itemId: 'a1', categoria: 'Materiales', tipo: 'Alcohol',
      codigo: 'MT-001', unidad: 'ml', stockDisponible: 250,
    });

    const [con_id] = mapearItemsBackend([
      { _id: 'b2', nombre: 'Reactivo', tipo: 'reactivo', codigo: 'RC-001', unidad: 'g' },
    ]);
    expect(con_id.id).toBe('b2');
    expect(con_id.itemId).toBe('b2');
    // stockDisponible ausente -> 0
    expect(con_id.stockDisponible).toBe(0);
    expect(con_id.categoria).toBe('Reactivos');
  });
});

describe('mapearLoteBackend', () => {
  test('resuelve itemId poblado (objeto) tomando su id/nombre/código', () => {
    const lote = mapearLoteBackend({
      id: 'l1',
      itemId: { id: 'it1', nombre: 'Cloruro', codigo: 'SUS-002' },
      cantidadDisponible: 500,
      ubicacion: 'Depósito A',
      estado: 'disponible',
      fechaVencimiento: '2027-01-03T00:00:00.000Z',
    });
    expect(lote).toMatchObject({
      id: 'l1', loteId: 'l1', itemId: 'it1', tipo: 'Cloruro', codigo: 'SUS-002',
      ubicacion: 'Depósito A', estado: 'Disponible', cantidad: 500,
    });
  });

  test('resuelve itemId como string (sin poblar)', () => {
    const lote = mapearLoteBackend({
      _id: 'l2', itemId: 'it2', cantidadDisponible: 10, ubicacion: 'B', estado: 'descartado',
    });
    expect(lote.itemId).toBe('it2');
    expect(lote.loteId).toBe('l2');
    expect(lote.estado).toBe('Descartado');
    expect(lote.tipo).toBeUndefined();
  });
});

describe('mapas de tipo', () => {
  test("tipoToCategoria conserva la entrada 'equipo' (la usa el historial de descartes)", () => {
    expect(tipoToCategoria['equipo']).toBe('Equipos');
  });

  test('categoriaATipoItem no incluye Equipos (evita tipo=equipo -> 400)', () => {
    expect(categoriaATipoItem['Materiales']).toBe('material');
    expect(categoriaATipoItem['Reactivos']).toBe('reactivo');
    expect(categoriaATipoItem['Sustancias basicas']).toBe('sustancia');
    expect(categoriaATipoItem['Equipos']).toBeUndefined();
  });
});
