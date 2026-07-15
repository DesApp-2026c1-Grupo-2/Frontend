import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PanelDescartes from '../../components/historial/PanelDescartes';
import { getDescartes } from '../../services/descartes';

vi.mock('../../services/descartes', () => ({ getDescartes: vi.fn() }));

// Cards (mobile) y tabla (desktop) se renderizan juntas en jsdom: los asserts
// de datos se scopean a la tabla para no chocar con los duplicados.
const enTabla = () => within(screen.getByRole('table'));

const descartes = [
  {
    _id: 'd-1',
    itemId: { nombre: 'Alcohol etílico', codigo: 'IT-001' },
    tipo: 'reactivo',
    cantidad: 2,
    motivo: 'Vencido',
    createdAt: '2026-05-10T10:00:00.000Z',
    usuarioId: { nombre: 'Ana', apellido: 'Pérez' },
  },
  {
    _id: 'd-2',
    equipoId: { nombre: 'Microscopio', codigo: 'EQ-001' },
    tipo: 'equipo',
    cantidad: 1,
    motivo: '',
    createdAt: '2026-05-11T10:00:00.000Z',
    usuarioId: null, // descarte de sistema
  },
  {
    _id: 'd-3',
    tipo: 'material',
    cantidad: 5,
    createdAt: '2026-05-12T10:00:00.000Z',
    usuarioId: {},
  },
];

describe('PanelDescartes Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getDescartes.mockResolvedValue({ total: 3, descartes });
  });

  const renderPanel = async () => {
    const utils = render(<PanelDescartes />);
    await waitFor(() => expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument());
    return utils;
  };

  test('muestra el estado de carga y pide los descartes sin filtro de tipo', async () => {
    render(<PanelDescartes />);

    expect(screen.getByText('Cargando historial...')).toBeInTheDocument();

    // La categoría "Todos" no mapea a ningún tipo: se manda undefined.
    await waitFor(() => expect(getDescartes).toHaveBeenCalledWith({
      tipo: undefined,
      desde: undefined,
      hasta: undefined,
      page: 1,
      limit: 20,
    }));
  });

  test('lista los descartes resolviendo item o equipo', async () => {
    await renderPanel();

    const tabla = enTabla();
    expect(tabla.getByText('Alcohol etílico')).toBeInTheDocument();
    // El registro puede venir poblado por equipoId en vez de itemId.
    expect(tabla.getByText('Microscopio')).toBeInTheDocument();
    expect(tabla.getByText('Ana Pérez')).toBeInTheDocument();
    expect(tabla.getByText('Sistema')).toBeInTheDocument();
    expect(tabla.getByText('Sin responsable')).toBeInTheDocument();
  });

  test('muestra un texto por defecto cuando el descarte no tiene motivo', async () => {
    await renderPanel();

    expect(enTabla().getAllByText('Sin motivo registrado').length).toBe(2);
  });

  test('muestra el contador de descartes', async () => {
    await renderPanel();

    expect(screen.getByText('3 descartes')).toBeInTheDocument();
  });

  test('el contador usa el singular con un solo descarte', async () => {
    getDescartes.mockResolvedValue({ total: 1, descartes: [descartes[0]] });

    await renderPanel();

    expect(screen.getByText('1 descarte')).toBeInTheDocument();
  });

  test('avisa cuando no hay descartes', async () => {
    getDescartes.mockResolvedValue({ total: 0, descartes: [] });

    await renderPanel();

    expect(screen.getAllByText('No hay descartes registrados para la consulta actual.').length).toBeGreaterThan(0);
  });

  test('muestra el detalle del error del backend', async () => {
    getDescartes.mockRejectedValue({
      response: { data: { detalles: [{ message: 'rango de fechas inválido' }] } },
    });

    await renderPanel();

    expect(screen.getByText('rango de fechas inválido')).toBeInTheDocument();
  });

  test('usa un mensaje genérico si el error no trae detalle', async () => {
    getDescartes.mockRejectedValue(new Error('Network Error'));

    await renderPanel();

    expect(screen.getByText('No se pudieron cargar los descartes')).toBeInTheDocument();
  });

  test('filtrar por categoría traduce al tipo del backend', async () => {
    await renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Equipos' }));

    await waitFor(() => expect(getDescartes).toHaveBeenLastCalledWith(
      expect.objectContaining({ tipo: 'equipo', page: 1 })
    ));

    fireEvent.click(screen.getByRole('button', { name: 'Reactivos' }));

    await waitFor(() => expect(getDescartes).toHaveBeenLastCalledWith(
      expect.objectContaining({ tipo: 'reactivo' })
    ));
  });

  test('los filtros de fecha cubren el día completo', async () => {
    const { container } = await renderPanel();

    const [inputDesde, inputHasta] = container.querySelectorAll('input[type="date"]');

    fireEvent.change(inputDesde, { target: { value: '2026-01-01' } });
    await waitFor(() => expect(getDescartes).toHaveBeenLastCalledWith(
      expect.objectContaining({ desde: '2026-01-01T00:00:00Z' })
    ));

    fireEvent.change(inputHasta, { target: { value: '2026-01-31' } });
    await waitFor(() => expect(getDescartes).toHaveBeenLastCalledWith(
      expect.objectContaining({ hasta: '2026-01-31T23:59:59Z' })
    ));
  });

  test('limpiar filtros aparece solo con filtros activos y los resetea', async () => {
    await renderPanel();

    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Materiales' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Limpiar filtros' }));

    await waitFor(() => expect(getDescartes).toHaveBeenLastCalledWith(
      expect.objectContaining({ tipo: undefined, desde: undefined, hasta: undefined, page: 1 })
    ));
  });
});
