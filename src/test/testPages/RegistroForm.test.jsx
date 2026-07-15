import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import RegistroForm from '../../pages/RegistroForm';
import api from '../../api/axios';

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

const renderRegistro = () =>
  render(
    <MemoryRouter>
      <RegistroForm />
    </MemoryRouter>
  );

const completarFormulario = () => {
  fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { name: 'nombre', value: 'Juan' } });
  fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { name: 'apellido', value: 'Pérez' } });
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { name: 'email', value: 'juan@test.com' } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { name: 'password', value: '123456' } });
};

describe('RegistroForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza correctamente el formulario', () => {
    renderRegistro();

    expect(screen.getByRole('heading', { name: /Crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Legajo (opcional)')).toBeInTheDocument();
  });

  test('muestra errores de validación si se intenta enviar el formulario vacío', async () => {
    const { container } = renderRegistro();

    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El apellido es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El email es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument();

    expect(api.post).not.toHaveBeenCalled();
  });

  test('valida correctamente el formato del email', async () => {
    const { container } = renderRegistro();

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { name: 'email', value: 'emailinvalido' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('Ingresá un email válido')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  test('limpia el error de un campo al corregirlo', async () => {
    const { container } = renderRegistro();

    fireEvent.submit(container.querySelector('form'));
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { name: 'nombre', value: 'Juan' } });

    expect(screen.queryByText('El nombre es obligatorio')).not.toBeInTheDocument();
  });

  test('envía los datos correctamente y muestra la pantalla de confirmación', async () => {
    api.post.mockResolvedValueOnce({ data: {} });

    const { container } = renderRegistro();

    completarFormulario();
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/usuarios', expect.objectContaining({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        password: '123456',
        rol: 'DOCENTE',
      }));
    });

    expect(await screen.findByRole('heading', { name: /Perfecto/i })).toBeInTheDocument();
    expect(screen.getByText(/Tu usuario será enviado a revisión/i)).toBeInTheDocument();
  });

  test('omite el legajo del payload cuando se deja vacío', async () => {
    api.post.mockResolvedValueOnce({ data: {} });

    const { container } = renderRegistro();

    completarFormulario();
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    const payload = api.post.mock.calls[0][1];
    expect(payload).not.toHaveProperty('legajo');
  });

  test('envía el legajo cuando se completa', async () => {
    api.post.mockResolvedValueOnce({ data: {} });

    const { container } = renderRegistro();

    completarFormulario();
    fireEvent.change(screen.getByPlaceholderText('Legajo (opcional)'), { target: { name: 'legajo', value: '12345' } });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/usuarios', expect.objectContaining({ legajo: '12345' }));
    });
  });

  test('redirige automáticamente al login pasados 5 segundos del registro exitoso', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    api.post.mockResolvedValueOnce({ data: {} });

    const { container } = renderRegistro();

    completarFormulario();
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
    await screen.findByRole('heading', { name: /Perfecto/i });

    expect(mockNavigate).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/logIn');

    vi.useRealTimers();
  });

  test('muestra mensaje de error si la API rechaza la creación', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'El correo ya está registrado' } }
    });

    const { container } = renderRegistro();

    completarFormulario();
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('El correo ya está registrado')).toBeInTheDocument();
  });

  test('muestra el detalle de validación de Joi como texto, no como objeto', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          detalles: [{ message: '"password" es demasiado corta', path: ['password'] }],
        },
      },
    });

    const { container } = renderRegistro();

    completarFormulario();
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('"password" es demasiado corta')).toBeInTheDocument();
  });

  test('navega al login al hacer clic en "Ya tengo cuenta"', () => {
    renderRegistro();

    fireEvent.click(screen.getByRole('button', { name: /Ya tengo cuenta/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/logIn');
  });

  test('navega al login desde el botón "Volver"', () => {
    renderRegistro();

    fireEvent.click(screen.getByRole('button', { name: /Volver/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/logIn');
  });
});
