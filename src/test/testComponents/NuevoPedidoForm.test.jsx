import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import NuevoPedidoForm from '../../components/pedidos/NuevoPedidoForm';
import api from '../../api/axios';
import { getAllEquipos, getAllItems } from '../../services/equipamiento';

vi.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="FiX" />,
  FiLoader: () => <span data-testid="FiLoader" />,
  FiCheckCircle: () => <span data-testid="FiCheckCircle" />,
  FiChevronDown: () => <span data-testid="FiChevronDown" />,
}));

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Los equipos e items se piden vía service (pegan a /equipo?page=1&limit=100), no con api.get directo.
vi.mock('../../services/equipamiento', () => ({
  getAllEquipos: vi.fn(),
  getAllItems: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => {
  const mockUser = { _id: 'u-1', nombre: 'Docente', apellido: 'Test', email: 'docente@test.com' };
  return {
    useAuth: () => ({ user: mockUser })
  };
});

// La validación rechaza fechas pasadas, así que la fecha del test se calcula siempre a futuro.
const fechaFutura = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
};

describe('NuevoPedidoForm Component', () => {
  const mockOnClose = vi.fn();
  const mockOnCrear = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    // clearAllMocks no borra las implementaciones: hay tests que lo hacen fallar.
    mockOnCrear.mockResolvedValue({});

    api.get.mockImplementation((url) => {
      if (url === '/laboratorio') return Promise.resolve({ data: [{ _id: 'lab-1', nombre: 'Lab Química', capacidad: 30 }] });
      if (url === '/usuarios') return Promise.resolve({ data: [{ _id: 'u-1', nombre: 'Docente', apellido: 'Test', rol: 'DOCENTE' }] });
      if (url === '/actividades') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('Not found'));
    });

    getAllEquipos.mockResolvedValue([{ _id: 'eq-1', nombre: 'Microscopio', estado: 'disponible' }]);
    getAllItems.mockResolvedValue([{ _id: 'it-1', nombre: 'Vaso de precipitado', tipo: 'material', stockDisponible: 50 }]);
  });

  const esperarCarga = async () => {
    await waitFor(() => expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument());
  };

  test('renderiza el estado de carga y luego el formulario inicial (Paso 0)', async () => {
    render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);

    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();

    await esperarCarga();

    expect(screen.getByText('Datos Básicos')).toBeInTheDocument();
    expect(screen.getByText('Materia')).toBeInTheDocument();
  });

  test('muestra los errores inline si faltan datos obligatorios en el Paso 0', async () => {
    render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // La validación ya no usa window.alert: pinta un <p> debajo de cada campo.
    expect(screen.getByText('La materia es obligatoria')).toBeInTheDocument();
    expect(screen.getByText('Ingresá la cantidad de alumnos')).toBeInTheDocument();
    expect(screen.getByText('Seleccioná una fecha')).toBeInTheDocument();

    // Sigue en el paso 0.
    expect(screen.getByText('Materia')).toBeInTheDocument();
  });

  test('valida que la hora de finalización sea posterior a la de inicio', async () => {
    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    fireEvent.change(screen.getByPlaceholderText('Ej: Biología Celular'), { target: { value: 'Química Avanzada' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: 28'), { target: { value: '15' } });
    fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: fechaFutura() } });

    const [inputHora, inputHoraFin] = container.querySelectorAll('input[type="time"]');
    fireEvent.change(inputHora, { target: { value: '14:00' } });
    fireEvent.change(inputHoraFin, { target: { value: '10:00' } });

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(
      screen.getByText('La hora de finalización debe ser posterior a la hora de inicio.')
    ).toBeInTheDocument();
  });

  test('flujo completo: avanza por los pasos y envía el payload procesado', async () => {
    const fecha = fechaFutura();
    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    // --- PASO 0: datos básicos (el docente se autoselecciona con el usuario logueado) ---
    fireEvent.change(screen.getByPlaceholderText('Ej: Biología Celular'), { target: { value: 'Química Avanzada' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: 28'), { target: { value: '15' } });
    fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: fecha } });

    const [inputHora, inputHoraFin] = container.querySelectorAll('input[type="time"]');
    fireEvent.change(inputHora, { target: { value: '10:00' } });
    fireEvent.change(inputHoraFin, { target: { value: '12:00' } });

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // --- PASO 1: laboratorio y recursos (ambos opcionales) ---
    expect(screen.getByText(/Seleccionar recursos requeridos/i)).toBeInTheDocument();

    const selectLab = screen.getAllByRole('combobox').find((s) => s.querySelector('option[value="lab-1"]'));
    fireEvent.change(selectLab, { target: { value: 'lab-1' } });

    // Las secciones de recursos arrancan colapsadas: hay que expandir "Equipos".
    fireEvent.click(screen.getByRole('button', { name: /Equipos/i }));

    // Seleccionar el microscopio y fijar cantidad.
    const checkboxEq = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkboxEq);

    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    // Toggle: destildar y volver a tildar para cubrir la rama `if (existe)`.
    fireEvent.click(checkboxEq);
    fireEvent.click(checkboxEq);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } });

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    // --- PASO 2: resumen ---
    expect(screen.getByText('Resumen del pedido')).toBeInTheDocument();
    expect(screen.getByText('Química Avanzada')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));

    // --- PASO 3: confirmación (el texto aparece en el paso y en el overlay de envío) ---
    await waitFor(() => {
      expect(screen.getAllByText('¡Pedido enviado!').length).toBeGreaterThan(0);
    });

    expect(mockOnCrear).toHaveBeenCalledTimes(1);
    expect(mockOnCrear).toHaveBeenCalledWith(expect.objectContaining({
      materia: 'Química Avanzada',
      docente: 'u-1',
      alumnos: 15,
      fecha,
      hora: '10:00',
      duracionClase: 120, // 10:00 → 12:00
      laboratorio: 'lab-1',
      recursos: [
        expect.objectContaining({ recursoId: 'eq-1', tipoRecurso: 'Equipo', cantidad: 5 })
      ]
    }));
  });

  test('el botón Cancelar del Paso 0 llama a onClose', async () => {
    render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Completa el paso 0 con datos válidos para poder avanzar.
  const completarPaso0 = (container, { hora = '10:00', horaFin = '12:00', alumnos = '15' } = {}) => {
    fireEvent.change(screen.getByPlaceholderText('Ej: Biología Celular'), { target: { value: 'Química' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: 28'), { target: { value: alumnos } });
    fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: fechaFutura() } });

    const [inputHora, inputHoraFin] = container.querySelectorAll('input[type="time"]');
    fireEvent.change(inputHora, { target: { value: hora } });
    fireEvent.change(inputHoraFin, { target: { value: horaFin } });
  };

  test('rechaza una cantidad de alumnos menor o igual a cero', async () => {
    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    completarPaso0(container, { alumnos: '0' });
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(await screen.findByText('La cantidad de alumnos debe ser mayor a 0.')).toBeInTheDocument();
  });

  test('rechaza una hora de inicio fuera del horario permitido', async () => {
    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    completarPaso0(container, { hora: '07:00' });
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(
      await screen.findByText('La hora de inicio debe ser entre las 08:00 y las 21:00.')
    ).toBeInTheDocument();
  });

  test('rechaza una hora de finalización posterior a las 22:00', async () => {
    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    completarPaso0(container, { horaFin: '22:30' });
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(await screen.findByText('La hora de finalización máxima es a las 22:00.')).toBeInTheDocument();
  });

  test('rechaza una fecha anterior a hoy', async () => {
    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    completarPaso0(container);
    fireEvent.change(container.querySelector('input[type="date"]'), { target: { value: '2020-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(await screen.findByText('La fecha no puede ser anterior a hoy.')).toBeInTheDocument();
  });

  test('el botón Anterior vuelve al paso previo', async () => {
    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    completarPaso0(container);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByText(/Seleccionar recursos requeridos/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Anterior/i }));

    expect(screen.getByText('Materia')).toBeInTheDocument();
  });

  test('muestra el error del backend si falla el envío', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnCrear.mockRejectedValue({
      response: { data: { error: 'Conflicto de horario', detalles: [{ message: 'lab ocupado' }] } },
    });

    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    completarPaso0(container);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));

    expect(await screen.findByText(/Conflicto de horario lab ocupado/)).toBeInTheDocument();
  });

  test('usa un mensaje genérico si el backend no da detalle', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnCrear.mockRejectedValue(new Error('Network Error'));

    const { container } = render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    completarPaso0(container);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /Finalizar/i }));

    expect(await screen.findByText(/Ocurrió un error al procesar el pedido/)).toBeInTheDocument();
  });

  test('si falla la carga de datos el formulario se renderiza igual, sin recursos', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Promise.allSettled tolera los rejects: el form no colapsa y solo queda sin datos.
    getAllEquipos.mockRejectedValue(new Error('Network Error'));
    getAllItems.mockRejectedValue(new Error('Network Error'));
    api.get.mockRejectedValue(new Error('Network Error'));

    render(<NuevoPedidoForm onClose={mockOnClose} onCrear={mockOnCrear} />);
    await esperarCarga();

    expect(screen.getByText('Datos Básicos')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
