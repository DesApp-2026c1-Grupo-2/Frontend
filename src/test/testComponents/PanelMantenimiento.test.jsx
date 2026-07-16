import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PanelMantenimiento from '../../components/historial/PanelMantenimiento';
import { getMantenimientos, getAllEquipos } from '../../services/equipamiento';

vi.mock('../../services/equipamiento', () => ({
  getMantenimientos: vi.fn(),
  getAllEquipos: vi.fn(),
}));

const enTabla = () => within(screen.getByRole('table'));

const registros = [
  {
    _id: 'r-1',
    tipo: 'correctivo',
    inicio: '2026-05-10T10:00:00.000Z',
    fin: null, // sin fin: sigue en curso
    descripcion: 'Se rompió la lámpara',
    responsableId: { nombre: 'Ana', apellido: 'Pérez' },
  },
  {
    _id: 'r-2',
    tipo: 'preventivo',
    inicio: '2026-04-01T10:00:00.000Z',
    fin: '2026-04-02T10:00:00.000Z',
    descripcion: '',
    responsableId: null,
  },
  {
    _id: 'r-3',
    tipo: 'desconocido', // fuera del enum: cae al badge por defecto
    inicio: '2026-03-01T10:00:00.000Z',
    fin: '2026-03-02T10:00:00.000Z',
    descripcion: 'Otro',
    responsableId: {},
  },
];

describe('PanelMantenimiento Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getAllEquipos.mockResolvedValue([
      { id: 'eq-1', nombre: 'Microscopio', codigo: 'EQ-001' },
      { id: 'eq-2', nombre: 'Centrífuga', codigo: 'EQ-002' },
    ]);
    getMantenimientos.mockResolvedValue({
      paginacion: { total: 3, totalPaginas: 1 },
      registros,
    });
  });

  // El selector de equipo es un SelectBuscable: el trigger es el primer botón.
  const elegirEquipo = async (nombre) => {
    fireEvent.click(await screen.findByText('Seleccioná un equipo…'));
    fireEvent.click(await screen.findByRole('button', { name: nombre }));
    await waitFor(() => expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument());
  };

  test('sin equipo elegido no consulta y pide elegir uno', async () => {
    render(<PanelMantenimiento />);

    await waitFor(() => expect(getAllEquipos).toHaveBeenCalled());

    expect(screen.getByText('Seleccioná un equipo para ver su historial de mantenimiento.')).toBeInTheDocument();
    // A diferencia de los otros paneles, este no arranca cargando.
    expect(getMantenimientos).not.toHaveBeenCalled();
    expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument();
  });

  test('elegir un equipo consulta su historial', async () => {
    render(<PanelMantenimiento />);

    await elegirEquipo('Microscopio · EQ-001');

    expect(getMantenimientos).toHaveBeenCalledWith('eq-1', {
      tipo: undefined,
      page: 1,
      limit: 20,
    });
  });

  test('lista los registros con su tipo, estado y responsable', async () => {
    render(<PanelMantenimiento />);
    await elegirEquipo('Microscopio · EQ-001');

    const tabla = enTabla();
    expect(tabla.getByText('Correctivo')).toBeInTheDocument();
    expect(tabla.getByText('Preventivo')).toBeInTheDocument();
    // Un tipo fuera del enum se muestra crudo.
    expect(tabla.getByText('desconocido')).toBeInTheDocument();
    // Sin fecha de fin el mantenimiento sigue abierto.
    expect(tabla.getAllByText('En curso').length).toBeGreaterThan(0);
    expect(tabla.getByText('Ana Pérez')).toBeInTheDocument();
    expect(tabla.getAllByText('Sin responsable').length).toBe(2);
  });

  test('muestra el contador solo con un equipo elegido', async () => {
    render(<PanelMantenimiento />);

    expect(screen.queryByText('3 mantenimientos')).not.toBeInTheDocument();

    await elegirEquipo('Microscopio · EQ-001');

    expect(screen.getByText('3 mantenimientos')).toBeInTheDocument();
  });

  test('el contador usa el singular con un solo registro', async () => {
    getMantenimientos.mockResolvedValue({
      paginacion: { total: 1, totalPaginas: 1 },
      registros: [registros[0]],
    });

    render(<PanelMantenimiento />);
    await elegirEquipo('Microscopio · EQ-001');

    expect(screen.getByText('1 mantenimiento')).toBeInTheDocument();
  });

  test('avisa cuando el equipo no tiene mantenimientos', async () => {
    getMantenimientos.mockResolvedValue({ paginacion: { total: 0, totalPaginas: 1 }, registros: [] });

    render(<PanelMantenimiento />);
    await elegirEquipo('Microscopio · EQ-001');

    expect(screen.getAllByText('Este equipo no tiene mantenimientos registrados.').length).toBeGreaterThan(0);
  });

  test('filtrar por tipo vuelve a consultar', async () => {
    render(<PanelMantenimiento />);
    await elegirEquipo('Microscopio · EQ-001');

    fireEvent.click(screen.getByRole('button', { name: 'Correctivo' }));

    await waitFor(() => expect(getMantenimientos).toHaveBeenLastCalledWith('eq-1', {
      tipo: 'correctivo',
      page: 1,
      limit: 20,
    }));
  });

  test('limpiar filtros aparece solo con un tipo elegido', async () => {
    render(<PanelMantenimiento />);
    await elegirEquipo('Microscopio · EQ-001');

    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Preventivo' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Limpiar filtros' }));

    await waitFor(() => expect(getMantenimientos).toHaveBeenLastCalledWith('eq-1', {
      tipo: undefined,
      page: 1,
      limit: 20,
    }));
  });

  test('muestra el detalle del error del backend', async () => {
    getMantenimientos.mockRejectedValue({
      response: { data: { detalles: [{ message: 'equipo inexistente' }] } },
    });

    render(<PanelMantenimiento />);
    await elegirEquipo('Microscopio · EQ-001');

    expect(screen.getByText('equipo inexistente')).toBeInTheDocument();
  });

  test('usa un mensaje genérico si el error no trae detalle', async () => {
    getMantenimientos.mockRejectedValue(new Error('Network Error'));

    render(<PanelMantenimiento />);
    await elegirEquipo('Microscopio · EQ-001');

    expect(screen.getByText('No se pudo cargar el historial de mantenimiento')).toBeInTheDocument();
  });

  test('no rompe si falla la carga de equipos', async () => {
    getAllEquipos.mockRejectedValue(new Error('Network Error'));

    render(<PanelMantenimiento />);

    expect(await screen.findByText('Seleccioná un equipo para ver su historial de mantenimiento.')).toBeInTheDocument();
  });
});
