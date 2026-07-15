import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PanelMovimientos from '../../components/historial/PanelMovimientos';
import { getMovimientos } from '../../services/movimientos';
import { obtenerEdificios } from '../../services/edificioService';
import { obtenerLaboratoriosPorEdificio } from '../../services/laboratorioService';

// Se mockean los services y no api/axios: getMovimientos ya está testeado
// aparte y así el panel no depende de la forma de la query.
vi.mock('../../services/movimientos', () => ({ getMovimientos: vi.fn() }));
vi.mock('../../services/edificioService', () => ({ obtenerEdificios: vi.fn() }));
vi.mock('../../services/laboratorioService', () => ({ obtenerLaboratoriosPorEdificio: vi.fn() }));

// El panel renderiza cards (mobile) y tabla (desktop) a la vez; jsdom no aplica
// los `hidden md:block` de Tailwind, así que cada dato aparece dos veces. Los
// asserts de datos se scopean a la tabla.
const enTabla = () => within(screen.getByRole('table'));

const movimientos = [
  {
    _id: 'm-1',
    itemId: { nombre: 'Alcohol etílico', codigo: 'IT-001' },
    tipoMovimiento: 'DESCARTE',
    cantidad: -3,
    cantidadAnterior: 10,
    cantidadNueva: 7,
    createdAt: '2026-05-10T10:00:00.000Z',
    usuarioId: { nombre: 'Ana', apellido: 'Pérez' },
    origenLaboratorioId: { nombre: 'Lab Química' },
  },
  {
    _id: 'm-2',
    itemId: { nombre: 'Vaso', codigo: 'IT-002' },
    tipoMovimiento: 'COMPRA',
    cantidad: 5,
    cantidadAnterior: 0,
    cantidadNueva: 5,
    createdAt: '2026-05-11T10:00:00.000Z',
    usuarioId: null, // movimiento de sistema
  },
  {
    _id: 'm-3',
    itemId: { nombre: 'Pipeta', codigo: 'IT-003' },
    tipoMovimiento: 'TRANSFERENCIA',
    cantidad: 0, // cambio de ubicación: no altera el stock
    cantidadAnterior: 4,
    cantidadNueva: 4,
    createdAt: '2026-05-12T10:00:00.000Z',
    usuarioId: {},
    origenLaboratorioId: { nombre: 'Depósito' },
    destinoLaboratorioId: { nombre: 'Lab Física' },
  },
];

describe('PanelMovimientos Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getMovimientos.mockResolvedValue({ total: 3, movimientos });
    obtenerEdificios.mockResolvedValue([{ id: 'edif-1', nombre: 'Edificio A' }]);
    obtenerLaboratoriosPorEdificio.mockResolvedValue([{ id: 'lab-1', nombre: 'Lab Química' }]);
  });

  const renderPanel = async () => {
    const utils = render(<PanelMovimientos />);
    await waitFor(() => expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument());
    return utils;
  };

  test('muestra el estado de carga y pide los movimientos sin filtros', async () => {
    render(<PanelMovimientos />);

    expect(screen.getByText('Cargando historial...')).toBeInTheDocument();

    await waitFor(() => expect(getMovimientos).toHaveBeenCalledWith({
      tipoMovimiento: undefined,
      laboratorioId: undefined,
      desde: undefined,
      hasta: undefined,
      page: 1,
      limit: 20,
    }));
  });

  test('lista los movimientos con su cantidad, stock y responsable', async () => {
    await renderPanel();

    const tabla = enTabla();
    expect(tabla.getByText('Alcohol etílico')).toBeInTheDocument();
    // Cantidad con signo explícito.
    expect(tabla.getByText('-3')).toBeInTheDocument();
    expect(tabla.getByText('+5')).toBeInTheDocument();
    // Un movimiento de cantidad 0 es un cambio de ubicación.
    expect(tabla.getByText('Ubicación')).toBeInTheDocument();
    // usuarioId null => movimiento de sistema.
    expect(tabla.getByText('Sistema')).toBeInTheDocument();
    // usuarioId objeto vacío => sin nombre.
    expect(tabla.getByText('Sin responsable')).toBeInTheDocument();
    expect(tabla.getByText('Ana Pérez')).toBeInTheDocument();
  });

  test('muestra el laboratorio de origen y destino de una transferencia', async () => {
    await renderPanel();

    const tabla = enTabla();
    expect(tabla.getByText('Depósito → Lab Física')).toBeInTheDocument();
    // Solo origen: se muestra ese.
    expect(tabla.getByText('Lab Química')).toBeInTheDocument();
    // Sin laboratorios: guion.
    expect(tabla.getAllByText('—').length).toBeGreaterThan(0);
  });

  test('muestra el contador de movimientos', async () => {
    await renderPanel();

    expect(screen.getByText('3 movimientos')).toBeInTheDocument();
  });

  test('el contador usa el singular con un solo movimiento', async () => {
    getMovimientos.mockResolvedValue({ total: 1, movimientos: [movimientos[0]] });

    await renderPanel();

    expect(screen.getByText('1 movimiento')).toBeInTheDocument();
  });

  test('avisa cuando no hay movimientos', async () => {
    getMovimientos.mockResolvedValue({ total: 0, movimientos: [] });

    await renderPanel();

    expect(screen.getAllByText('No hay movimientos registrados para la consulta actual.').length).toBeGreaterThan(0);
    expect(screen.getByText('0 movimientos')).toBeInTheDocument();
  });

  test('muestra el detalle del error del backend', async () => {
    getMovimientos.mockRejectedValue({
      response: { data: { detalles: [{ message: 'hasta no puede ser anterior a desde' }] } },
    });

    await renderPanel();

    expect(screen.getByText('hasta no puede ser anterior a desde')).toBeInTheDocument();
  });

  test('usa un mensaje genérico si el error no trae detalle', async () => {
    getMovimientos.mockRejectedValue(new Error('Network Error'));

    await renderPanel();

    expect(screen.getByText('No se pudieron cargar los movimientos')).toBeInTheDocument();
  });

  test('filtrar por tipo vuelve a consultar', async () => {
    await renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Descarte' }));

    await waitFor(() => expect(getMovimientos).toHaveBeenLastCalledWith(
      expect.objectContaining({ tipoMovimiento: 'DESCARTE', page: 1 })
    ));
  });

  test('la cascada edificio → laboratorio filtra por laboratorio', async () => {
    const { container } = await renderPanel();

    const [selectEdificio, selectLab] = container.querySelectorAll('select');
    // Sin edificio elegido no se puede elegir laboratorio.
    expect(selectLab).toBeDisabled();

    fireEvent.change(selectEdificio, { target: { value: 'edif-1' } });
    await waitFor(() => expect(obtenerLaboratoriosPorEdificio).toHaveBeenCalledWith('edif-1'));
    await waitFor(() => expect(selectLab).toBeEnabled());

    fireEvent.change(selectLab, { target: { value: 'lab-1' } });

    await waitFor(() => expect(getMovimientos).toHaveBeenLastCalledWith(
      expect.objectContaining({ laboratorioId: 'lab-1' })
    ));
  });

  test('los filtros de fecha cubren el día completo', async () => {
    const { container } = await renderPanel();

    const [inputDesde, inputHasta] = container.querySelectorAll('input[type="date"]');

    fireEvent.change(inputDesde, { target: { value: '2026-01-01' } });
    await waitFor(() => expect(getMovimientos).toHaveBeenLastCalledWith(
      expect.objectContaining({ desde: '2026-01-01T00:00:00Z' })
    ));

    fireEvent.change(inputHasta, { target: { value: '2026-01-31' } });
    await waitFor(() => expect(getMovimientos).toHaveBeenLastCalledWith(
      expect.objectContaining({ hasta: '2026-01-31T23:59:59Z' })
    ));
  });

  test('limpiar filtros aparece solo con filtros activos y los resetea', async () => {
    await renderPanel();

    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Descarte' }));
    const limpiar = await screen.findByRole('button', { name: 'Limpiar filtros' });

    fireEvent.click(limpiar);

    await waitFor(() => expect(getMovimientos).toHaveBeenLastCalledWith(
      expect.objectContaining({ tipoMovimiento: undefined, laboratorioId: undefined, page: 1 })
    ));
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  test('tolera que el backend no devuelva edificios', async () => {
    obtenerEdificios.mockResolvedValue(null);

    await renderPanel();

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('no rompe si falla la carga de edificios', async () => {
    obtenerEdificios.mockRejectedValue(new Error('Network Error'));

    await renderPanel();

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
