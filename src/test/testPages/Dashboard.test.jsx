import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../../pages/Dashboard';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../services/useDashboardData', () => ({
  usePedidos: vi.fn(),
  useMateriales: vi.fn(),
  useUsoEquipos: vi.fn()
}));

// Simplificamos AppLayout
vi.mock('../../components/AppLayout', () => ({
  AppLayout: ({ children }) => <div data-testid="app-layout">{children}</div>
}));

// El calendario y las stats de usuarios pegan a la API por su cuenta.
vi.mock('../../components/dashboard/DashboardCalendario', () => ({
  default: () => <div data-testid="dashboard-calendario">Calendar Mock</div>
}));

vi.mock('../../components/dashboard/UsuariosStatsCard', () => ({
  default: () => <div data-testid="usuarios-stats">Usuarios Mock</div>
}));

import { useAuth } from '../../context/AuthContext';
import { usePedidos, useMateriales, useUsoEquipos } from '../../services/useDashboardData';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({ user: { nombre: 'Test', email: 'test@test.com', rol: 'PERSONAL' } });
    usePedidos.mockReturnValue({ pedidos: [], loading: false });
    useMateriales.mockReturnValue({ materiales: [], loading: false });
    useUsoEquipos.mockReturnValue({ estadisticas: { equipos: [], desde: null, hasta: null, paginacion: {} }, loading: false });
  });

  test('renderiza las métricas de pedidos, el calendario y el equipamiento para PERSONAL', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Total de pedidos')).toBeInTheDocument();
    expect(screen.getByText('Pedidos aprobados')).toBeInTheDocument();
    expect(screen.getByText('Uso de equipos')).toBeInTheDocument();
    expect(screen.getByText('Alerta de stock')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-calendario')).toBeInTheDocument();
  });

  test('el DOCENTE ve bienvenida y pedidos, pero no la sección de equipamiento', () => {
    useAuth.mockReturnValue({ user: { nombre: 'Test', email: 'test@test.com', rol: 'DOCENTE' } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Hola, Test/i)).toBeInTheDocument();
    expect(
      screen.getByText('Consultá tus pedidos y las reservas de cada laboratorio para organizar tus clases.')
    ).toBeInTheDocument();
    expect(screen.getByText('Total de pedidos')).toBeInTheDocument();
    expect(screen.queryByText('Uso de equipos')).not.toBeInTheDocument();
  });

  test('el ADMIN ve las stats de usuarios en lugar de las métricas de pedidos', () => {
    useAuth.mockReturnValue({ user: { nombre: 'Test', email: 'test@test.com', rol: 'ADMIN' } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Panel de administración')).toBeInTheDocument();
    expect(screen.getByTestId('usuarios-stats')).toBeInTheDocument();
    expect(screen.queryByText('Total de pedidos')).not.toBeInTheDocument();
  });
});