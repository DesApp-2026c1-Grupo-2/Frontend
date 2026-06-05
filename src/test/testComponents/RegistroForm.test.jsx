import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import RegistroForm from '../../components/RegistroForm';
import api from '../../api/axios';

// Mock de la API
vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('RegistroForm Component', () => {
  const mockOnVolverLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza correctamente el formulario', () => {
    render(<RegistroForm onVolverLogin={mockOnVolverLogin} />);
    
    expect(screen.getByRole('heading', { name: /Crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
  });

  test('muestra errores de validación si se intenta enviar el formulario vacío', async () => {
    const { container } = render(<RegistroForm onVolverLogin={mockOnVolverLogin} />);
    
    fireEvent.submit(container.querySelector('form'));
    
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El apellido es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El email es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument();
    
    // Comprobamos que no se llamó a la API
    expect(api.post).not.toHaveBeenCalled();
  });

  test('valida correctamente el formato del email', async () => {
    const { container } = render(<RegistroForm onVolverLogin={mockOnVolverLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { name: 'email', value: 'emailinvalido' } });
    fireEvent.submit(container.querySelector('form'));
    
    expect(await screen.findByText('Ingresá un email válido')).toBeInTheDocument();
  });

  test('envía los datos correctamente y muestra mensaje de éxito', async () => {
    api.post.mockResolvedValue({ data: { message: 'Success' } });
    
    const { container } = render(<RegistroForm onVolverLogin={mockOnVolverLogin} />);
    
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { name: 'nombre', value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { name: 'apellido', value: 'Pérez' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { name: 'email', value: 'juan@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { name: 'password', value: '123456' } });
    
    fireEvent.submit(container.querySelector('form'));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/usuarios', expect.objectContaining({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        password: '123456',
        rol: 'DOCENTE'
      }));
    });
    
    expect(screen.getByText('Usuario creado correctamente')).toBeInTheDocument();
    
    // Los campos deberían haberse reseteado tras el éxito
    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('');
  });

  test('muestra mensaje de error si la API rechaza la creación', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: 'El correo ya está registrado' } }
    });
    
    const { container } = render(<RegistroForm onVolverLogin={mockOnVolverLogin} />);
    
    // Llenar campos válidos
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { name: 'nombre', value: 'Juan' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { name: 'apellido', value: 'Pérez' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { name: 'email', value: 'juan@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { name: 'password', value: '123456' } });
    
    fireEvent.submit(container.querySelector('form'));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
    
    // Verificar el mensaje de error de la API
    expect(screen.getByText('El correo ya está registrado')).toBeInTheDocument();
  });

  test('llama a la función onVolverLogin al hacer clic en "Ya tengo cuenta"', () => {
    render(<RegistroForm onVolverLogin={mockOnVolverLogin} />);
    
    const btnVolver = screen.getByRole('button', { name: /Ya tengo cuenta/i });
    fireEvent.click(btnVolver);
    
    expect(mockOnVolverLogin).toHaveBeenCalledTimes(1);
  });
});