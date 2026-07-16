import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import EditarPedidoForm from '../../components/pedidos/EditarPedidoForm';
import api from '../../api/axios';
import { getAllEquipos, getAllItems } from '../../services/equipamiento';

vi.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="FiX" />,
  FiChevronDown: () => <span data-testid="FiChevronDown" />,
}));

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../services/equipamiento', () => ({
  getAllEquipos: vi.fn(),
  getAllItems: vi.fn(),
}));

// El input de fecha tiene min={hoy} y extraerFecha usa toISOString.
const fechaFutura = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(10, 0, 0, 0);
  return d;
};

const pedidoBase = () => ({
  _id: 'pedido-1',
  materia: 'Química General',
  docente: { _id: 'u-1', nombre: 'Ana', apellido: 'Pérez' },
  alumnos: 15,
  fechaHora: fechaFutura().toISOString(),
  duracionClase: 120,
  laboratorio: { _id: 'lab-1', nombre: 'Lab Química' },
  recursos: [
    { recursoId: { _id: 'it-1', nombre: 'Vaso de precipitado' }, tipoRecurso: 'Item', tipoDetalle: 'Material', cantidad: 3 },
  ],
});

describe('EditarPedidoForm Component', () => {
  const mockOnClose = vi.fn();
  const mockOnGuardar = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnGuardar.mockResolvedValue({});

    api.get.mockImplementation((url) => {
      if (url === '/laboratorio') {
        return Promise.resolve({ data: [
          { _id: 'lab-1', nombre: 'Lab Química', capacidad: 30 },
          { _id: 'lab-2', nombre: 'Lab Chico', capacidad: 5 },
        ]});
      }
      if (url === '/usuarios') {
        return Promise.resolve({ data: [{ _id: 'u-1', nombre: 'Ana', apellido: 'Pérez', rol: 'DOCENTE' }] });
      }
      return Promise.reject(new Error('Not found'));
    });

    getAllEquipos.mockResolvedValue([
      { _id: 'eq-1', nombre: 'Microscopio', estado: 'disponible' },
    ]);
    getAllItems.mockResolvedValue([
      { _id: 'it-1', nombre: 'Vaso de precipitado', tipo: 'material' },
      { _id: 'it-2', nombre: 'Ácido clorhídrico', tipo: 'reactivo' },
    ]);
  });

  const renderForm = async (pedido = pedidoBase()) => {
    const utils = render(
      <EditarPedidoForm pedido={pedido} onClose={mockOnClose} onGuardar={mockOnGuardar} />
    );
    await waitFor(() => expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument());
    return utils;
  };

  test('muestra el estado de carga y luego hidrata los datos del pedido', async () => {
    render(<EditarPedidoForm pedido={pedidoBase()} onClose={mockOnClose} onGuardar={mockOnGuardar} />);

    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument());

    expect(screen.getByText('Editar pedido')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Química General')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();

    // La sección del recurso ya pedido se auto-expande y su checkbox queda tildado.
    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes.some((c) => c.checked)).toBe(true);
  });

  test('extrae la hora de inicio y calcula la de fin con la duración', async () => {
    const { container } = await renderForm();

    const [inputHora, inputHoraFin] = container.querySelectorAll('input[type="time"]');
    // fechaFutura() fija las 10:00 y duracionClase es 120 minutos.
    expect(inputHora.value).toBe('10:00');
    expect(inputHoraFin.value).toBe('12:00');
  });

  test('muestra los errores inline si se vacían los campos obligatorios', async () => {
    await renderForm();

    fireEvent.change(screen.getByDisplayValue('Química General'), { target: { value: '' } });
    fireEvent.change(screen.getByDisplayValue('15'), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(await screen.findByText('La materia es obligatoria.')).toBeInTheDocument();
    // Con alumnos vacío Number('') es 0, así que gana el mensaje de la validación de rango.
    expect(screen.getByText('La cantidad de alumnos debe ser mayor a 0.')).toBeInTheDocument();
    expect(mockOnGuardar).not.toHaveBeenCalled();
  });

  test('rechaza una cantidad de alumnos menor o igual a cero', async () => {
    await renderForm();

    fireEvent.change(screen.getByDisplayValue('15'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(await screen.findByText('La cantidad de alumnos debe ser mayor a 0.')).toBeInTheDocument();
  });

  test('rechaza una hora de finalización anterior a la de inicio', async () => {
    const { container } = await renderForm();

    const [, inputHoraFin] = container.querySelectorAll('input[type="time"]');
    fireEvent.change(inputHoraFin, { target: { value: '09:00' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(
      await screen.findByText('La hora de finalización debe ser posterior a la hora de inicio.')
    ).toBeInTheDocument();
  });

  test('rechaza una hora de inicio fuera del rango permitido', async () => {
    const { container } = await renderForm();

    const [inputHora] = container.querySelectorAll('input[type="time"]');
    fireEvent.change(inputHora, { target: { value: '07:00' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(
      await screen.findByText('La hora de inicio debe ser entre las 08:00 y las 21:00.')
    ).toBeInTheDocument();
  });

  test('rechaza una hora de finalización posterior a las 22:00', async () => {
    const { container } = await renderForm();

    const [, inputHoraFin] = container.querySelectorAll('input[type="time"]');
    fireEvent.change(inputHoraFin, { target: { value: '22:30' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(await screen.findByText('La hora de finalización máxima es a las 22:00.')).toBeInTheDocument();
  });

  test('guarda mandando solo IDs y la duración calculada', async () => {
    const pedido = pedidoBase();
    await renderForm(pedido);

    fireEvent.change(screen.getByDisplayValue('Química General'), { target: { value: 'Química Orgánica' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => expect(mockOnGuardar).toHaveBeenCalledTimes(1));

    expect(mockOnGuardar).toHaveBeenCalledWith(expect.objectContaining({
      materia: 'Química Orgánica',
      docente: 'u-1',
      alumnos: 15,
      hora: '10:00',
      duracionClase: 120,
      laboratorio: 'lab-1',
      recursos: [
        expect.objectContaining({ recursoId: 'it-1', tipoRecurso: 'Item', cantidad: 3 }),
      ],
    }));
  });

  test('muestra el error del backend si onGuardar rechaza', async () => {
    mockOnGuardar.mockRejectedValue({ response: { data: { error: 'Conflicto de horario' } } });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await renderForm();

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(await screen.findByText('Conflicto de horario')).toBeInTheDocument();
  });

  test('usa un mensaje genérico si el error no trae detalle del backend', async () => {
    mockOnGuardar.mockRejectedValue(new Error('Network Error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await renderForm();

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    expect(await screen.findByText('Error al actualizar el pedido.')).toBeInTheDocument();
  });

  test('permite tildar y destildar recursos y cambiar la cantidad', async () => {
    await renderForm();

    // Expandir la sección de equipos para llegar al checkbox.
    fireEvent.click(screen.getByRole('button', { name: /Equipos/i }));

    const checkboxEquipo = screen.getAllByRole('checkbox').find((c) => !c.checked);
    fireEvent.click(checkboxEquipo);

    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '4' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => expect(mockOnGuardar).toHaveBeenCalled());
    const payload = mockOnGuardar.mock.calls[0][0];
    expect(payload.recursos.length).toBe(2);
  });

  test('el botón Cancelar llama a onClose', async () => {
    await renderForm();

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('acepta un pedido con docente y laboratorio como strings planos', async () => {
    const pedido = {
      ...pedidoBase(),
      docente: 'u-9',
      laboratorio: 'lab-2',
      recursos: [],
    };

    await renderForm(pedido);

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => expect(mockOnGuardar).toHaveBeenCalled());
    expect(mockOnGuardar).toHaveBeenCalledWith(expect.objectContaining({
      docente: 'u-9',
      laboratorio: 'lab-2',
      recursos: [],
    }));
  });

  test('si falla la carga de datos el formulario se muestra igual', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockRejectedValue(new Error('Network Error'));
    getAllEquipos.mockRejectedValue(new Error('Network Error'));
    getAllItems.mockRejectedValue(new Error('Network Error'));

    await renderForm();

    expect(screen.getByText('Editar pedido')).toBeInTheDocument();
  });
});
