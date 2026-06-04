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
  const mockCerrarModal = vi.fn();

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
        return Promise.resolve({ data: [{ _id: 'edif-1', nombre: 'Edificio A' }] });
      }
      if (url === '/laboratorio/edificio/edif-1') {
        return Promise.resolve({ data: [{ _id: 'lab-1', nombre: 'Lab Física' }] });
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
        cerrarModal={mockCerrarModal} 
      />
    );

    expect(screen.getByDisplayValue('Microscopio')).toBeInTheDocument();
    
    // Esperar a que los useEffect carguen los edificios y los laboratorios (por ser fijo y tener edificio)
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/edificio');
      expect(api.get).toHaveBeenCalledWith('/laboratorio/edificio/edif-1');
      
      // Chequeamos que las opciones de los selects hayan cargado
      expect(screen.getByText('Edificio A')).toBeInTheDocument();
      expect(screen.getByText('Lab Física')).toBeInTheDocument();
    });
  });

  test('deshabilita edificio y laboratorio si es un equipo móvil (esFijo = false)', async () => {
    const mobileData = { ...defaultFormData, esFijo: false, edificioId: '', laboratorioId: '' };
    
    const { container } = render(
      <FormularioEquipo 
        formData={mobileData} 
        handleChange={mockHandleChange} 
        handleSubmit={mockHandleSubmit} 
        cerrarModal={mockCerrarModal} 
      />
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/edificio'));

    const selectsDisabled = screen.getAllByText('No aplica a equipos móviles');
    expect(selectsDisabled.length).toBe(2); // Uno para Edificio, otro para Laboratorio

    // El select de edificio debe estar deshabilitado
    const edificioSelect = container.querySelector('select[name="edificioId"]');
    expect(edificioSelect).toBeDisabled();
  });

  test('llama a handleChange y a los botones submit / cancelar', async () => {
    const { container } = render(
      <FormularioEquipo 
        formData={defaultFormData} 
        handleChange={mockHandleChange} 
        handleSubmit={mockHandleSubmit} 
        cerrarModal={mockCerrarModal} 
      />
    );

    // Escribir en un input
    const inputCodigo = screen.getByDisplayValue('EQ-001');
    fireEvent.change(inputCodigo, { target: { name: 'codigo', value: 'EQ-002' } });
    expect(mockHandleChange).toHaveBeenCalled();

    // Cancelar
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(mockCerrarModal).toHaveBeenCalledTimes(1);

    // Guardar
    fireEvent.submit(container.querySelector('form'));
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});