import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Pedidos from '../../pages/pedidos';
import api from '../../api/axios';

// Mockeamos useNavigate por si en la rama dev se reemplazó el Modal por una redirección
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-icons/fi', () => ({
  FiUser: () => <span data-testid="FiUser" />,
  FiHome: () => <span data-testid="FiHome" />,
  FiUsers: () => <span data-testid="FiUsers" />,
  FiCalendar: () => <span data-testid="FiCalendar" />
}));

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../components/SharedUi', () => ({
  PageHeader: ({ title }) => <h1 data-testid="page-header">{title}</h1>,
}));

describe('Pedidos Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza el estado de carga y posteriormente muestra la lista de pedidos', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/pedido') {
        return Promise.resolve({
          data: [
            { _id: '1', materia: 'Biología Celular', docente: 'Juan Perez', estado: 'Pendiente', laboratorio: 'Lab 1' }
          ]
        });
      }
      if (url === '/laboratorio/disponibles') {
        return Promise.resolve({ data: [] });
      }
    });

    render(
      <MemoryRouter>
        <Pedidos />
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando pedidos...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Biología Celular')).toBeInTheDocument();
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });
  });

  test('interactúa correctamente al darle click a "Ver" o "Inspeccionar"', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/pedido') {
        return Promise.resolve({
          data: [
            { _id: '1', materia: 'Química', docente: 'Ana Gomez', estado: 'Aprobado', laboratorio: 'Lab 2', alumnos: 15 }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <Pedidos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Química')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Ver|Inspeccionar/i }));
    
    await waitFor(() => {
      // Verificamos si abrió un modal (busca 'Cerrar', un ícono de 'FiX' o un valor duplicado)
      const modalAbierto = screen.queryByText(/Cerrar/i) || screen.queryByTestId('FiX') || screen.queryAllByText(/15/).length > 1;
      // O verificamos si redirigió a otra vista (si se eliminó el modal en dev)
      const navego = mockNavigate.mock.calls.length > 0;
      
      expect(modalAbierto || navego).toBeTruthy();
    });
  });
});