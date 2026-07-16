import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Equipamiento from '../../pages/equipamiento';
import * as equipamientoService from '../../services/equipamiento';

// Mock completo del servicio de equipamiento (nuevo contrato paginado)
vi.mock('../../services/equipamiento', () => ({
  getItems: vi.fn(),
  getAllItems: vi.fn(),
  getEstadisticasItems: vi.fn(),
  getLotes: vi.fn(),
  getLotesByItemId: vi.fn(),
  getEquipos: vi.fn(),
  createItem: vi.fn(),
  createLote: vi.fn(),
  updateItem: vi.fn(),
  updateLote: vi.fn(),
  deleteItem: vi.fn(),
  deleteLote: vi.fn(),
  createEquipo: vi.fn(),
  updateEquipo: vi.fn(),
  deleteEquipo: vi.fn(),
  registrarMantenimiento: vi.fn(),
  finalizarMantenimiento: vi.fn(),
}));

// Mock de los servicios usados para armar el mapa laboratorioId -> nombre.
vi.mock('../../services/edificioService', () => ({
  obtenerEdificios: vi.fn(() => Promise.resolve([])),
}));
vi.mock('../../services/laboratorioService', () => ({
  obtenerLaboratoriosPorEdificio: vi.fn(() => Promise.resolve([])),
}));

// useAuth: la página lo usa para permisos; en el test alcanza con un usuario ADMIN.
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { rol: 'ADMIN' } }),
}));

// Simplificamos PageHeader
vi.mock('../../components/SharedUi', () => ({
  PageHeader: ({ title, description }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <Equipamiento />
    </MemoryRouter>
  );

// Espera al primer render de datos (sale del estado "Cargando inventario...").
const irAMateriales = async () => {
  await waitFor(() =>
    expect(screen.queryAllByText('Cargando inventario...').length).toBe(0)
  );
  fireEvent.click(screen.getByRole('button', { name: /Materiales/i }));
};

describe('Equipamiento Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Valores por defecto: listados vacíos.
    equipamientoService.getEquipos.mockResolvedValue({ total: 0, page: 1, limit: 20, equipos: [] });
    equipamientoService.getItems.mockResolvedValue({ total: 0, page: 1, limit: 20, items: [] });
    equipamientoService.getAllItems.mockResolvedValue([]);
    equipamientoService.getEstadisticasItems.mockResolvedValue({
      equipos: 2, materiales: 4, reactivos: 3, sustancias: 1, descartes: 1,
    });
    equipamientoService.getLotesByItemId.mockResolvedValue([]);
    // /lotes es dual: con page/limit devuelve { lotes }, sin ellos un array.
    equipamientoService.getLotes.mockImplementation(({ page } = {}) =>
      page ? Promise.resolve({ total: 0, page: 1, limit: 10, lotes: [] }) : Promise.resolve([])
    );
  });

  test('renderiza el estado de carga y luego muestra los items con su stockDisponible', async () => {
    equipamientoService.getItems.mockResolvedValue({
      total: 1, page: 1, limit: 20,
      items: [
        { id: '1', nombre: 'Alcohol etílico', tipo: 'material', codigo: 'MT-001', unidad: 'ml', esConsumible: true, stockDisponible: 500 },
      ],
    });

    renderPage();

    expect(screen.getAllByText('Cargando inventario...').length).toBe(2);

    await irAMateriales();

    await waitFor(() => {
      expect(screen.getAllByText('Alcohol etílico').length).toBeGreaterThan(0);
      // El stock total es el stockDisponible del backend, no una suma de lotes.
      expect(screen.getAllByText('500 ml').length).toBeGreaterThan(0);
    });
  });

  test('muestra un mensaje de error si falla la carga del listado', async () => {
    equipamientoService.getEquipos.mockRejectedValue(new Error('Fetch falló'));

    renderPage();

    await waitFor(() => {
      const errorMessages = screen.getAllByText('No se pudieron cargar los datos del inventario');
      expect(errorMessages.length).toBe(2); // vista móvil + escritorio
    });
  });

  test('al expandir un ítem pide sus lotes on-demand con estado disponible', async () => {
    equipamientoService.getItems.mockResolvedValue({
      total: 1, page: 1, limit: 20,
      items: [
        { id: 'abc', nombre: 'Cloruro de Sodio', tipo: 'material', codigo: 'MT-002', unidad: 'g', esConsumible: true, stockDisponible: 300 },
      ],
    });
    equipamientoService.getLotes.mockImplementation(({ itemId, page } = {}) => {
      if (page) return Promise.resolve({ total: 0, page: 1, limit: 10, lotes: [] });
      if (itemId === 'abc') {
        return Promise.resolve([
          { id: 'l1', itemId: { id: 'abc', nombre: 'Cloruro de Sodio', codigo: 'MT-002' }, cantidadDisponible: 300, estado: 'disponible' },
        ]);
      }
      return Promise.resolve([]);
    });

    renderPage();
    await irAMateriales();

    await waitFor(() => expect(screen.getAllByText('Cloruro de Sodio').length).toBeGreaterThan(0));

    fireEvent.click(screen.getAllByText('Cloruro de Sodio')[0]);

    await waitFor(() => {
      expect(equipamientoService.getLotes).toHaveBeenCalledWith(
        expect.objectContaining({ itemId: 'abc', estado: 'disponible' })
      );
      // Sin laboratorioId, la ubicación del lote se muestra como "Depósito".
      expect(screen.getAllByText('Depósito').length).toBeGreaterThan(0);
    });
  });

  test('el paginador refleja el total y pasa a la página siguiente', async () => {
    equipamientoService.getItems.mockResolvedValue({
      total: 45, page: 1, limit: 20,
      items: [
        { id: '1', nombre: 'Item Uno', tipo: 'material', codigo: 'MT-001', unidad: 'ml', esConsumible: true, stockDisponible: 10 },
      ],
    });

    renderPage();
    await irAMateriales();

    await waitFor(() => expect(screen.getByText('Página 1 de 3')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    await waitFor(() =>
      expect(equipamientoService.getItems).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, tipo: 'material' })
      )
    );
  });

  test('la búsqueda envía el término q al backend (con debounce)', async () => {
    renderPage();

    await waitFor(() => expect(equipamientoService.getEquipos).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre o código/i), {
      target: { value: 'micro' },
    });

    await waitFor(() =>
      expect(equipamientoService.getEquipos).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'micro' })
      )
    );
  });

  test('las tarjetas superiores se construyen desde /items/estadisticas', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Sustancias')).toBeInTheDocument();
      // Materiales = 4 según el mock de estadísticas.
      expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    });
  });

  test('el panel de alertas lista los materiales con bajo stock', async () => {
    // El panel "Alertas de inventario" pide todos los materiales (getAllItems) y
    // filtra los que tienen stockDisponible <= 5.
    equipamientoService.getAllItems.mockResolvedValue([
      { id: 'x', nombre: 'Reactivo Vencido', tipo: 'material', codigo: 'RC-009', unidad: 'ml', esConsumible: true, stockDisponible: 2 },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Reactivo Vencido')).toBeInTheDocument();
      expect(screen.getByText('1 bajo stock')).toBeInTheDocument();
    });
  });
});
