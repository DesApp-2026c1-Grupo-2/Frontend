import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Equipamiento from '../../pages/equipamiento';
import * as equipamientoService from '../../services/equipamiento';

// Mock completo del servicio de equipamiento
vi.mock('../../services/equipamiento', () => ({
  getItems: vi.fn(),
  getLotes: vi.fn(),
  getEquipos: vi.fn(),
  createItem: vi.fn(),
  createLote: vi.fn(),
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

describe('Equipamiento Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza el estado de carga y luego muestra los items mapeados', async () => {
    // Simulamos respuesta válida
    equipamientoService.getItems.mockResolvedValue([
      { _id: '1', nombre: 'Microscopio', tipo: 'equipo', codigo: 'EQ-001', unidad: 'unidad', esConsumible: false }
    ]);
    equipamientoService.getLotes.mockResolvedValue([
      { _id: '10', itemId: '1', cantidadDisponible: 5, ubicacion: 'Lab Central', estado: 'disponible' }
    ]);
    equipamientoService.getEquipos.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Equipamiento />
      </MemoryRouter>
    );

    const loadingMessages = screen.getAllByText('Cargando inventario...');
    expect(loadingMessages.length).toBe(2); // Uno para la vista móvil y otro para escritorio

    await waitFor(() => {
      expect(screen.getAllByText('Microscopio').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lab Central').length).toBeGreaterThan(0);
    });
  });

  test('muestra un mensaje de error si falla la llamada al servicio de datos', async () => {
    equipamientoService.getItems.mockRejectedValue(new Error('Fetch falló'));
    equipamientoService.getLotes.mockResolvedValue([]);
    equipamientoService.getEquipos.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Equipamiento />
      </MemoryRouter>
    );

    await waitFor(() => {
      const errorMessages = screen.getAllByText('No se pudieron cargar los datos del inventario');
      expect(errorMessages.length).toBe(2); // Uno para la vista móvil y otro para escritorio
    });
  });
});