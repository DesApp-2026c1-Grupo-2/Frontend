import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/NavBar';

// Mock de AuthContext. El factory se hoistea, así que el usuario vive en un
// objeto mutable para poder cambiar de rol en cada test.
const auth = vi.hoisted(() => ({
  user: { nombre: 'Test', email: 'test@test.com', rol: 'ADMIN' },
  logout: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: auth.user, logout: auth.logout }),
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
    auth.user = { nombre: 'Test', email: 'test@test.com', rol: 'ADMIN' };
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
    // Con sesión iniciada se muestra "Salir"; "Login" solo aparece sin usuario.
    expect(screen.getAllByText('Salir')[0]).toBeInTheDocument();
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

    const hamburgerBtn = container.querySelector('button.xl\\:hidden');

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

    // Seleccionamos el botón hamburguesa utilizando la clase que lo oculta en desktop (xl:hidden)
    const hamburgerBtn = container.querySelector('button.xl\\:hidden');
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
  });

  test('navega a las secciones restantes', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText('Calendario')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/calendario');

    fireEvent.click(screen.getAllByText('Edificios')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/edificios');

    fireEvent.click(screen.getAllByText('Actividades')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/actividades');

    fireEvent.click(screen.getAllByText('Usuarios')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/aprobacion-usuarios');
  });

  test('marca como activa la sección en la que se está parado', () => {
    render(
      <MemoryRouter initialEntries={['/pedidos']}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Pedidos')[0].className).toMatch(/bg-emerald-600/);
    expect(screen.getAllByText('Dashboard')[0].className).not.toMatch(/bg-emerald-600/);
  });

  test('cerrar sesión pide confirmación antes de desloguear', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText('Salir')[0]);

    // El modal confirma primero: todavía no se deslogueó.
    expect(auth.logout).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Sí, cerrar sesión/i }));

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('cancelar la confirmación no cierra la sesión', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText('Salir')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(auth.logout).not.toHaveBeenCalled();
  });

  test('el DOCENTE no ve las secciones de administración', () => {
    auth.user = { nombre: 'Doc', rol: 'DOCENTE' };

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Pedidos')[0]).toBeInTheDocument();
    expect(screen.queryByText('Edificios')).not.toBeInTheDocument();
    expect(screen.queryByText('Equipamiento')).not.toBeInTheDocument();
    expect(screen.queryByText('Actividades')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  test('PERSONAL ve las secciones de administración pero no Usuarios', () => {
    auth.user = { nombre: 'Pers', rol: 'PERSONAL' };

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Edificios')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Equipamiento')[0]).toBeInTheDocument();
    // Usuarios es exclusivo de ADMIN.
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  test('normaliza el rol sin importar cómo venga escrito', () => {
    auth.user = { nombre: 'Admin', rol: 'admin' };

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Usuarios')[0]).toBeInTheDocument();
  });

  test('sin sesión ofrece el login en el menú móvil y no muestra el usuario', () => {
    auth.user = null;

    const { container } = render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.queryByText('Salir')).not.toBeInTheDocument();

    fireEvent.click(container.querySelector('button.xl\\:hidden'));
    fireEvent.click(screen.getByText('Login'));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('muestra la inicial del usuario en el avatar', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getAllByText('T')[0]).toBeInTheDocument();
  });
});