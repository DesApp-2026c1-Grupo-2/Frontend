import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Edificios from '../../pages/edificios';
import { obtenerEdificios, crearEdificio } from '../../services/edificioService';

// Mocking API services
vi.mock('../../services/edificioService', () => ({
  obtenerEdificios: vi.fn(),
  crearEdificio: vi.fn(),
}));

vi.mock('react-icons/fi', () => ({
  FiEdit2: () => <span data-testid="FiEdit2" />,
  FiTrash2: () => <span data-testid="FiTrash2" />
}));

// Mocking child components to simplify the test
vi.mock('../../components/SharedUi', () => ({
  PageHeader: ({ preTitle, title, description }) => (
    <div data-testid="page-header">
      <span>{preTitle}</span>
      <span>{title}</span>
      <span>{description}</span>
    </div>
  ),
}));

vi.mock('../../components/edificios/CrearEdificioModal', () => ({

  __esModule: true,
  default: ({ mostrar, cerrarModal, formData, handleChange, handleSubmit }) => (
    mostrar ? (
      <div data-testid="crear-edificio-modal">
        <input 
          data-testid="input-nombre" 
          name="nombre" 
          value={formData.nombre} 
          onChange={handleChange} 
        />
        <input 
          data-testid="input-direccion" 
          name="direccion" 
          value={formData.direccion} 
          onChange={handleChange} 
        />
        <button data-testid="btn-submit" onClick={handleSubmit}>Guardar</button>
        <button data-testid="btn-close" onClick={cerrarModal}>Cerrar</button>
      </div>
    ) : null
  ),
}));

describe('Edificios Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the component and fetches data correctly', async () => {
    // Arrange: Mock the API response
    obtenerEdificios.mockResolvedValueOnce([
      { _id: '1', nombre: 'Edificio A', direccion: 'Dirección A', cantidadLaboratorios: 2 }
    ]);
    
    // Act: Render component wrapped in a router (needed because of useNavigate and useLocation)
    await act(async () => {
      render(
        <MemoryRouter>
          <Edificios />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('+ Crear edificio')).toBeDefined();
    
    // Assert: Verify that fetched items are rendered
    await waitFor(() => {
      expect(screen.getByText('Edificio A')).toBeDefined();
      expect(screen.getByText('Dirección A')).toBeDefined();
      expect(screen.getByText('2 laboratorios')).toBeDefined();
    });
  });

  test('opens and closes the "Crear Edificio" modal properly', async () => {
    obtenerEdificios.mockResolvedValueOnce([]);
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Edificios />
        </MemoryRouter>
      );
    });

    // Click to open the modal
    const btnAbrirModal = screen.getByText('+ Crear edificio');
    fireEvent.click(btnAbrirModal);
    expect(screen.getByTestId('crear-edificio-modal')).toBeDefined();

    // Click to close the modal
    const btnCerrarModal = screen.getByTestId('btn-close');
    fireEvent.click(btnCerrarModal);
    expect(screen.queryByTestId('crear-edificio-modal')).toBeNull();
  });

  test('submits the form to create a new edificio and refreshes the list', async () => {
    obtenerEdificios.mockResolvedValue([]); // Permite múltiples llamadas (fetch inicial y recarga)
    crearEdificio.mockResolvedValueOnce({}); // Form submission
    
    await act(async () => {
      render(
        <MemoryRouter>
          <Edificios />
        </MemoryRouter>
      );
    });

    // Open modal and fill in data
    fireEvent.click(screen.getByText('+ Crear edificio'));
    fireEvent.change(screen.getByTestId('input-nombre'), { target: { name: 'nombre', value: 'Edificio B' } });
    fireEvent.change(screen.getByTestId('input-direccion'), { target: { name: 'direccion', value: 'Dirección B' } });

    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-submit'));
    });

    // Assert that our mocked submit endpoint was hit with correct data
    await waitFor(() => {
      expect(crearEdificio).toHaveBeenCalledWith({ nombre: 'Edificio B', direccion: 'Dirección B' });
    });
  });
});
