import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FormularioActualizarEstado from '../../components/equipamiento/FormularioActualizarEstado';

const equipoDisponible = { tipo: 'Microscopio', codigo: 'EQ-001', estado: 'Disponible' };

describe('FormularioActualizarEstado Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) =>
    render(<FormularioActualizarEstado equipo={equipoDisponible} onSubmit={mockOnSubmit} {...props} />);

  // El handler del CustomSelect vive en el <button> dentro del <li role="option">.
  const elegirOpcion = (triggerTexto, opcionNombre) => {
    fireEvent.click(screen.getByText(triggerTexto));
    const opcion = screen.getByRole('option', { name: opcionNombre });
    fireEvent.click(within(opcion).getByRole('button'));
  };

  test('muestra el equipo y su estado actual en solo lectura', () => {
    renderForm();

    expect(screen.getByDisplayValue('Microscopio · EQ-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Disponible')).toBeInTheDocument();
  });

  test('desde Disponible propone Mantenimiento y pide los datos del mantenimiento', () => {
    renderForm();

    // Primera transición válida desde "disponible".
    expect(screen.getByText('Mantenimiento')).toBeInTheDocument();
    expect(screen.getByText('Tipo de mantenimiento')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Detalle del mantenimiento...')).toBeInTheDocument();
  });

  test('iniciar mantenimiento envía tipo y descripción', () => {
    const { container } = renderForm();

    fireEvent.change(screen.getByPlaceholderText('Detalle del mantenimiento...'), {
      target: { value: '  cambio de lámpara  ' },
    });
    fireEvent.submit(container.querySelector('form'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      accion: 'iniciarMantenimiento',
      destino: 'mantenimiento',
      tipo: 'preventivo',
      descripcion: 'cambio de lámpara',
      fecha: undefined,
    });
  });

  test('permite elegir el tipo correctivo y una fecha de inicio', () => {
    const { container } = renderForm();

    elegirOpcion('Preventivo', 'Correctivo');
    fireEvent.change(container.querySelector('input[type="datetime-local"]'), {
      target: { value: '2026-05-10T10:30' },
    });

    fireEvent.submit(container.querySelector('form'));

    const payload = mockOnSubmit.mock.calls[0][0];
    expect(payload.tipo).toBe('correctivo');
    expect(payload.fecha).toBe(new Date('2026-05-10T10:30').toISOString());
  });

  test('desde Mantenimiento propone volver a Disponible y avisa que se cierra', () => {
    const { container } = renderForm({ equipo: { ...equipoDisponible, estado: 'Mantenimiento' } });

    expect(screen.getByText(/Se cerrará el mantenimiento y el equipo volverá a/)).toBeInTheDocument();

    fireEvent.submit(container.querySelector('form'));

    // Al finalizar, el backend fija la fecha: el payload va sin tipo ni fecha.
    expect(mockOnSubmit).toHaveBeenCalledWith({
      accion: 'finalizarMantenimiento',
      destino: 'disponible',
    });
  });

  test('un cambio directo a fuera de servicio incluye el estado', () => {
    const { container } = renderForm({ equipo: { ...equipoDisponible, estado: 'Mantenimiento' } });

    // "Disponible" también aparece en el aviso de cierre: se abre por el trigger.
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    const opcion = screen.getByRole('option', { name: 'Fuera de servicio' });
    fireEvent.click(within(opcion).getByRole('button'));

    fireEvent.submit(container.querySelector('form'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      accion: 'cambioDirecto',
      destino: 'fuera de servicio',
      estado: 'fuera de servicio',
    });
  });

  test('desde Fuera de servicio la única transición es volver a Disponible', () => {
    renderForm({ equipo: { ...equipoDisponible, estado: 'Fuera de servicio' } });

    expect(screen.getByDisplayValue('Fuera de servicio')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Disponible'));
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  test('sin equipo cae a disponible y no rompe', () => {
    const { container } = renderForm({ equipo: undefined });

    const [inputEquipo] = container.querySelectorAll('input[readonly]');
    expect(inputEquipo).toHaveValue('');
    expect(screen.getByDisplayValue('Disponible')).toBeInTheDocument();
  });

  test('mientras envía deshabilita el botón y avisa', () => {
    renderForm({ enviando: true });

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
  });
});
