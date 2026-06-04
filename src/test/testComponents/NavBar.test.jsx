import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/NavBar';

// Mock de AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { nombre: 'Test', email: 'test@test.com', rol: 'ADMIN' } })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza correctamente el logo y botones desktop', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByAltText('Universidad Nacional de Hurlingham')).toBeInTheDocument();
    
    // Botones de la versión Desktop
    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Equipamiento')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Pedidos')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Login')[0]).toBeInTheDocument();
  });

  test('navega correctamente al hacer click en los enlaces desktop', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText('Equipamiento')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/equipamiento');

    fireEvent.click(screen.getAllByText('Pedidos')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/pedidos');

    fireEvent.click(screen.getAllByText('Dashboard')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

    fireEvent.click(screen.getAllByText('Login')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/logIn');
  });

  test('el botón principal del logo navega a Inicio', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('Ir al inicio'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('abre y cierra el menú móvil al hacer clic repetidamente en el botón hamburguesa', () => {
    const { container } = render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const hamburgerBtn = container.querySelector('button.md\\:hidden');
    
    // Abrir menú
    fireEvent.click(hamburgerBtn);
    expect(screen.getAllByText('Dashboard').length).toBe(2); // Desktop y Mobile

    // Cerrar menú manualmente
    fireEvent.click(hamburgerBtn);
    expect(screen.getAllByText('Dashboard').length).toBe(1); // Solo Desktop
  });

  test('abre el menú móvil y navega correctamente cerrando el menú (todos los enlaces)', () => {
    const { container } = render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Seleccionamos el botón hamburguesa utilizando la clase que lo oculta en desktop (md:hidden)
    const hamburgerBtn = container.querySelector('button.md\\:hidden');
    fireEvent.click(hamburgerBtn);

    // Navegación de Dashboard
    fireEvent.click(screen.getAllByText('Dashboard')[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

    // Abrir de nuevo y probar Equipamiento
    fireEvent.click(hamburgerBtn);
    fireEvent.click(screen.getAllByText('Equipamiento')[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/equipamiento');

    // Abrir de nuevo y probar Pedidos
    fireEvent.click(hamburgerBtn);
    fireEvent.click(screen.getAllByText('Pedidos')[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/pedidos');

    // Abrir de nuevo y probar Login
    fireEvent.click(hamburgerBtn);
    fireEvent.click(screen.getAllByText('Login')[1]);
    expect(mockNavigate).toHaveBeenCalledWith('/logIn');
  });
});