import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import NuevoPedidoForm from '../../components/NuevoPedidoForm';
import api from '../../api/axios';

vi.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="FiX" />
}));

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../context/AuthContext', () => {
  const mockUser = { _id: 'u-1', nombre: 'Docente', apellido: 'Test', email: 'docente@test.com' };
  return {
    useAuth: () => ({ user: mockUser })
  };
});

describe('NuevoPedidoForm Component', () => {
  const mockOnClose = vi.fn();
  const mockOnCrear = vi.fn().mockResolvedValue({}); // Devuelve promesa por si handleCrear es async

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn(); // Evitamos que los alerts reales bloqueen el test

    api.get.mockImplementation((url) => {
      if (url === '/laboratorio') return Promise.resolve({ data: [{ _id: 'lab-1', nombre: 'Lab Química', capacidad: 30 }] });
      if (url === '/usuarios') return Promise.resolve({ data: [{ _id: 'u-1', nombre: 'Docente', apellido: 'Test', rol: 'DOCENTE' }] });
      if (url === '/equipo') return Promise.resolve({ data: [{ _id: 'eq-1', nombre: 'Microscopio', estado: 'disponible' }] });
      if (url === '/items') return Promise.resolve({ data: [{ _id: 'it-1', nombre: 'Vaso de precipitado', tipo: 'material' }] });
      return Promise.reject(new Error('Not found'));
    });
  });

  test('renderiza el estado de carga y luego el formulario inicial (Paso 0)', async () => {
    render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Datos Básicos')).toBeInTheDocument();
    expect(screen.getByText('Materia')).toBeInTheDocument();
  });

  test('falla la validación si faltan datos en el Paso 0', async () => {
    render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await waitFor(() => expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument());

    const btnSiguiente = screen.getByRole('button', { name: /Siguiente/i });
    fireEvent.click(btnSiguiente);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Faltan completar datos obligatorios'));
  });

  test('flujo completo: avanza exitosamente por los pasos 0, 1, 2 y 3', async () => {
    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await waitFor(() => expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument());

    // --- PASO 0: Completar información base ---
    fireEvent.change(screen.getByPlaceholderText('Ej: Biología Celular'), { target: { value: 'Química Avanzada' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: 28'), { target: { value: '15' } });
    
    const dateInput = container.querySelector('input[type="date"]');
    const timeInput = container.querySelector('input[type="time"]');
    fireEvent.change(dateInput, { target: { value: '2026-10-15' } });
    fireEvent.change(timeInput, { target: { value: '10:30' } });

    const selects = screen.getAllByRole('combobox');
    // Para asegurar que pase la validación, forzamos ambos valores
    fireEvent.change(selects[0], { target: { value: 'u-1' } }); // Seleccionar docente
    fireEvent.change(selects[1], { target: { value: 'lab-1' } }); // Seleccionar laboratorio

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // --- PASO 1: Selección de recursos ---
    expect(screen.getByText(/Seleccionar recursos requeridos/i)).toBeInTheDocument();
    
    // Falla si avanza sin seleccionar nada
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('al menos un recurso'));

    // Seleccionar microscopio
    const checkboxEq = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkboxEq); // Tilda

    // Cambiar cantidad
    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    // Toggle: desmarcar y volver a marcar para cubrir la rama `if (existe)`
    fireEvent.click(checkboxEq); // Destilda
    fireEvent.click(checkboxEq); // Vuelve a tildar
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } });

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // --- PASO 2: Resumen ---
    expect(screen.getByText('Resumen del pedido')).toBeInTheDocument();
    expect(screen.getByText('Química Avanzada')).toBeInTheDocument();
    
    // Finalizar
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));

    // --- PASO 3: Confirmación de enviado ---
    await waitFor(() => {
      expect(screen.getByText('¡Pedido enviado!')).toBeInTheDocument();
    });
    
    // Verificamos que se haya llamado a onCrear con el payload procesado correctamente
    expect(mockOnCrear).toHaveBeenCalledTimes(1);
    expect(mockOnCrear).toHaveBeenCalledWith(expect.objectContaining({
      materia: 'Química Avanzada',
      alumnos: 15,
      fecha: '2026-10-15',
      hora: '10:30',
      laboratorio: 'lab-1',
      recursos: [
        expect.objectContaining({ recursoId: 'eq-1', cantidad: 5 })
      ]
    }));
  });

  test('funcionalidad de los botones Cancelar y Anterior', async () => {
    render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await waitFor(() => expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument());

    // En el Paso 0, el botón Cancelar llama a la propiedad onClose
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('maneja errores al hacer fetch de los datos', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Forzamos un error sincrónico para que caiga en el bloque catch
    api.get.mockImplementation(() => { throw new Error('Network Error'); });
    
    render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await waitFor(() => expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument());
    
    // El componente se renderiza sin colapsar (arreglos vacíos)
    expect(consoleSpy).toHaveBeenCalledWith("Error al cargar datos:", expect.any(Error));
    consoleSpy.mockRestore();
  });
});