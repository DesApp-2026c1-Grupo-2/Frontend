import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../../pages/Dashboard';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../services/useDashboardData', () => ({
  usePedidos: vi.fn(),
  useEquipamiento: vi.fn(),
  useMateriales: vi.fn()
}));

vi.mock('../../services/useCalendarReservas', () => ({
  useCalendarReservas: vi.fn()
}));

// Simplificamos AppLayout
vi.mock('../../components/AppLayout', () => ({
  AppLayout: ({ children }) => <div data-testid="app-layout">{children}</div>
}));

// Simplificamos LabCalendar
vi.mock('../../components/LabCalendar', () => ({
  LabCalendar: () => <div data-testid="lab-calendar">Calendar Mock</div>
}));

import { useAuth } from '../../context/AuthContext';
import { usePedidos, useEquipamiento, useMateriales } from '../../services/useDashboardData';
import { useCalendarReservas } from '../../services/useCalendarReservas';

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

    useAuth.mockReturnValue({ user: { nombre: 'Test', email: 'test@test.com', rol: 'ADMIN' } });
    usePedidos.mockReturnValue({ pedidos: [], loading: false });
    useEquipamiento.mockReturnValue({ equipamiento: [], loading: false });
    useMateriales.mockReturnValue({ materiales: [], loading: false });
    useCalendarReservas.mockReturnValue({ eventosLabCalendar: [], loading: false, handleDateRangeChange: vi.fn(), dateRange: { start: '', end: '' } });
  });

  test('renderiza correctamente las métricas y componentes si el usuario tiene rol válido', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('TOTAL DE PEDIDOS')).toBeInTheDocument();
    expect(screen.getByText('PEDIDOS APROBADOS')).toBeInTheDocument();
    expect(screen.getByText('USO DE EQUIPOS')).toBeInTheDocument();
    expect(screen.getByText('ALERTA DE STOCK')).toBeInTheDocument();
    expect(screen.getByTestId('lab-calendar')).toBeInTheDocument();
  });

  test('muestra mensaje de bienvenida en lugar del dashboard si el rol no es válido', () => {
    useAuth.mockReturnValue({ user: { nombre: 'Test', email: 'test@test.com', rol: 'DOCENTE' } });
    
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/¡Bienvenido, Test!/i)).toBeInTheDocument();
    expect(screen.getByText('Desde el menú podés acceder a todas tus opciones operativas.')).toBeInTheDocument();
    expect(screen.queryByText('TOTAL DE PEDIDOS')).not.toBeInTheDocument();
  });
});