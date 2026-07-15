import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FormularioEquipo from '../../components/equipamiento/FormularioEquipo';
import api from '../../api/axios';

// Mock de la API
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('FormularioEquipo Component', () => {
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn((e) => e.preventDefault());

  const defaultFormData = {
    nombre: 'Microscopio',
    codigo: 'EQ-001',
    tipo: 'Óptico',
    esFijo: true,
    estado: 'disponible',
    edificioId: 'edif-1',
    laboratorioId: 'lab-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Simulamos las respuestas GET por defecto
    api.get.mockImplementation((url) => {
      if (url === '/edificio') {
        return Promise.resolve({ data: [{ id: 'edif-1', nombre: 'Edificio A' }] });
      }
      if (url === '/laboratorio/edificio/edif-1') {
        return Promise.resolve({
          data: [{ id: 'lab-1', nombre: 'Lab Física', tipo: 'fisica', capacidad: 20 }],
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  test('renderiza correctamente el formulario y realiza fetch de edificios y laboratorios', async () => {
    render(
      <FormularioEquipo
        formData={defaultFormData}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
      />
    );

    expect(screen.getByDisplayValue('Microscopio')).toBeInTheDocument();

    // Esperar a que los useEffect carguen los edificios y los laboratorios (por ser fijo y tener edificio)
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/edificio');
      expect(api.get).toHaveBeenCalledWith('/laboratorio/edificio/edif-1');
    });

    // Los CustomSelect muestran en el trigger el label de la opción seleccionada.
    expect(await screen.findByText('Edificio A')).toBeInTheDocument();
    expect(await screen.findByText(/Lab Física/)).toBeInTheDocument();
  });

  test('no renderiza la ubicación ni consulta edificios si es un equipo móvil (esFijo = false)', async () => {
    const mobileData = { ...defaultFormData, esFijo: false, edificioId: '', laboratorioId: '' };

    render(
      <FormularioEquipo
        formData={mobileData}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
      />
    );

    // El bloque de ubicación entero se omite para equipos móviles.
    expect(screen.queryByText('Edificio')).not.toBeInTheDocument();
    expect(screen.queryByText('Laboratorio')).not.toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  test('llama a handleChange al escribir y a handleSubmit al enviar', async () => {
    const { container } = render(
      <FormularioEquipo
        formData={defaultFormData}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
      />
    );

    // Escribir en un input
    const inputCodigo = screen.getByDisplayValue('EQ-001');
    fireEvent.change(inputCodigo, { target: { name: 'codigo', value: 'EQ-002' } });
    expect(mockHandleChange).toHaveBeenCalled();

    // Guardar
    fireEvent.submit(container.querySelector('form'));
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});