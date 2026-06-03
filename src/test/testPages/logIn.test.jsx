import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Login from '../../pages/logIn';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  test('renderiza el formulario de login correctamente', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
  });

  test('muestra un error si se intenta enviar con campos vacíos', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Completá todos los campos')).toBeInTheDocument();
  });

  test('inicia sesión exitosamente y redirige al dashboard', async () => {
    api.post.mockResolvedValueOnce({
      data: { usuario: { id: 1, email: 'test@test.com' }, token: 'fake-token' }
    });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/usuarios/login', { email: 'test@test.com', password: 'password123' });
      expect(mockLogin).toHaveBeenCalledWith({ id: 1, email: 'test@test.com' }, 'fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('maneja los errores provenientes del servidor', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Credenciales inválidas' } }
    });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
  });
});