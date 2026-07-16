import { describe, test, expect } from 'vitest';
import {
  mapearItemsBackend,
  mapearLoteBackend,
  mapearEquiposBackend,
  mapearEstado,
  formatDate,
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
      estado: 'disponible',
      fechaVencimiento: '2027-01-03T00:00:00.000Z',
    });
    expect(lote).toMatchObject({
      id: 'l1', loteId: 'l1', itemId: 'it1', tipo: 'Cloruro', codigo: 'SUS-002',
      estado: 'Disponible', cantidad: 500,
    });
  });

  test('resuelve itemId como string (sin poblar)', () => {
    const lote = mapearLoteBackend({
      _id: 'l2', itemId: 'it2', cantidadDisponible: 10, estado: 'descartado',
    });
    expect(lote.itemId).toBe('it2');
    expect(lote.loteId).toBe('l2');
    expect(lote.estado).toBe('Descartado');
    expect(lote.tipo).toBeUndefined();
  });

  test('sin laboratorioId la ubicación es "Depósito"', () => {
    const lote = mapearLoteBackend({ id: 'l3', itemId: 'it3', cantidadDisponible: 5, estado: 'disponible' });
    expect(lote.laboratorioId).toBeNull();
    expect(lote.ubicacionLote).toBe('Depósito');
  });

  test('con laboratorioId resuelve el nombre real desde labMap', () => {
    const lote = mapearLoteBackend(
      { id: 'l4', itemId: 'it4', cantidadDisponible: 8, estado: 'disponible', laboratorioId: 'lab-1' },
      { 'lab-1': 'Laboratorio de Química' }
    );
    expect(lote.laboratorioId).toBe('lab-1');
    expect(lote.ubicacionLote).toBe('Laboratorio de Química');
  });

  test('con laboratorioId poblado usa su nombre aunque no haya labMap', () => {
    const lote = mapearLoteBackend({
      id: 'l5', itemId: 'it5', cantidadDisponible: 3, estado: 'disponible',
      laboratorioId: { id: 'lab-2', nombre: 'Laboratorio de Física' },
    });
    expect(lote.laboratorioId).toBe('lab-2');
    expect(lote.ubicacionLote).toBe('Laboratorio de Física');
  });

  test('con laboratorioId sin match en labMap cae al genérico', () => {
    const lote = mapearLoteBackend({ id: 'l6', itemId: 'it6', cantidadDisponible: 2, estado: 'disponible', laboratorioId: 'lab-x' }, {});
    expect(lote.ubicacionLote).toBe('Laboratorio asignado');
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

describe('mapearEquiposBackend', () => {
  test('resuelve la ubicación desde el laboratorio poblado', () => {
    const [equipo] = mapearEquiposBackend([
      { _id: 'eq-1', nombre: 'Microscopio', codigo: 'EQ-001', estado: 'disponible', esFijo: true,
        laboratorioId: { _id: 'lab-1', nombre: 'Lab Química' } },
    ]);

    expect(equipo).toMatchObject({
      id: 'eq-1',
      categoria: 'Equipos',
      tipo: 'Microscopio',
      ubicacion: 'Lab Química',
      movilidad: 'Fija',
      cantidad: 1,
      esConsumible: false,
    });
  });

  test('sin poblar el laboratorio solo sabe que está asignado', () => {
    const [equipo] = mapearEquiposBackend([
      { id: 'eq-2', nombre: 'Centrífuga', estado: 'disponible', esFijo: false, laboratorioId: 'lab-1' },
    ]);

    expect(equipo.ubicacion).toBe('Laboratorio asignado');
    expect(equipo.movilidad).toBe('Movible');
  });

  test('cae al edificio cuando no hay laboratorio', () => {
    const [poblado] = mapearEquiposBackend([
      { _id: 'eq-3', nombre: 'Balanza', edificioId: { _id: 'ed-1', nombre: 'Edificio A' } },
    ]);
    const [sinPoblar] = mapearEquiposBackend([
      { _id: 'eq-4', nombre: 'Balanza', edificioId: 'ed-1' },
    ]);

    expect(poblado.ubicacion).toBe('Edificio A');
    expect(sinPoblar.ubicacion).toBe('Edificio asignado');
  });

  test('sin ubicación queda sin asignar', () => {
    const [equipo] = mapearEquiposBackend([{ _id: 'eq-5', nombre: 'Suelto' }]);

    expect(equipo.ubicacion).toBe('Sin asignar');
    expect(equipo.motivoDescarte).toBe('');
    expect(equipo.responsableDescarte).toBe('');
  });

  test('la fecha de descarte usa el primer campo disponible', () => {
    const [conDescarte] = mapearEquiposBackend([
      { _id: 'eq-6', nombre: 'X', fechaDescarte: '2026-01-01', updatedAt: '2025-01-01' },
    ]);
    const [soloUpdated] = mapearEquiposBackend([
      { _id: 'eq-7', nombre: 'X', updatedAt: '2025-01-01' },
    ]);

    expect(conDescarte.fechaDescarte).toBe('2026-01-01');
    expect(soloUpdated.fechaDescarte).toBe('2025-01-01');
  });
});

describe('mapearEstado', () => {
  test.each([
    ['disponible', 'Disponible'],
    ['en_uso', 'En uso'],
    ['descartado', 'Descartado'],
  ])('traduce %s', (backend, esperado) => {
    expect(mapearEstado(backend)).toBe(esperado);
  });

  test('un estado desconocido cae a Disponible', () => {
    expect(mapearEstado('inventado')).toBe('Disponible');
    expect(mapearEstado(undefined)).toBe('Disponible');
  });
});

describe('formatDate', () => {
  test('formatea a dd/mm/aaaa', () => {
    // Mediodía para que el huso horario no corra el día.
    expect(formatDate('2026-03-05T12:00:00.000Z')).toMatch(/05\/03\/2026/);
  });

  test('avisa cuando no hay fecha o es inválida', () => {
    expect(formatDate(null)).toBe('Sin fecha registrada');
    expect(formatDate('no-es-fecha')).toBe('Sin fecha registrada');
  });
});
