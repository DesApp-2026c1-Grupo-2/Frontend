import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FormularioActividad from '../../components/actividades/FormularioActividad';

const actividadExistente = {
  _id: 'act-1',
  nombre: 'Titulación',
  tipo: 'biologia',
  fecha: '2026-05-10T00:00:00.000Z',
  estado: 'en_proceso',
};

describe('FormularioActividad Component', () => {
  const mockOnGuardar = vi.fn();
  const mockOnCerrar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnGuardar.mockResolvedValue({});
  });

  const renderForm = (props = {}) =>
    render(<FormularioActividad onGuardar={mockOnGuardar} onCerrar={mockOnCerrar} {...props} />);

  test('en alta muestra el título de nueva y oculta el estado', () => {
    renderForm();

    expect(screen.getByText('Nueva actividad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear actividad' })).toBeInTheDocument();
    // El estado solo se edita sobre una actividad existente.
    expect(screen.queryByText('Estado')).not.toBeInTheDocument();
  });

  test('en edición prellena los campos y muestra el estado', () => {
    renderForm({ actividad: actividadExistente });

    expect(screen.getByText('Editar actividad')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Titulación')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-05-10')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });

  test('en edición sin fecha ni tipo cae a los valores por defecto', () => {
    const { container } = renderForm({ actividad: { _id: 'act-2', nombre: 'Sin datos' } });

    expect(container.querySelector('input[type="date"]')).toHaveValue('');
    const [selectTipo] = container.querySelectorAll('select');
    expect(selectTipo).toHaveValue('quimica');
  });

  test('exige nombre y fecha', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Crear actividad' }));

    expect(await screen.findByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('La fecha es obligatoria.')).toBeInTheDocument();
    expect(mockOnGuardar).not.toHaveBeenCalled();
  });

  test('un nombre en blanco no alcanza', async () => {
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('Ej. Práctica de titulación'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear actividad' }));

    expect(await screen.findByText('El nombre es obligatorio.')).toBeInTheDocument();
  });

  test('escribir en un campo con error lo limpia', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Crear actividad' }));
    expect(await screen.findByText('El nombre es obligatorio.')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Ej. Práctica de titulación'), {
      target: { value: 'Nueva' },
    });

    expect(screen.queryByText('El nombre es obligatorio.')).not.toBeInTheDocument();
  });

  test('guarda el payload con el nombre recortado', async () => {
    const { container } = renderForm();

    fireEvent.change(screen.getByPlaceholderText('Ej. Práctica de titulación'), {
      target: { value: '  Práctica nueva  ' },
    });
    fireEvent.change(container.querySelector('input[type="date"]'), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(container.querySelector('select'), { target: { value: 'teorica' } });

    fireEvent.click(screen.getByRole('button', { name: 'Crear actividad' }));

    await waitFor(() => expect(mockOnGuardar).toHaveBeenCalledWith({
      nombre: 'Práctica nueva',
      tipo: 'teorica',
      fecha: '2026-06-01',
      estado: 'planificada',
    }));
  });

  test('en edición permite cambiar el estado', async () => {
    const { container } = renderForm({ actividad: actividadExistente });

    const [, selectEstado] = container.querySelectorAll('select');
    fireEvent.change(selectEstado, { target: { value: 'finalizada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(mockOnGuardar).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'finalizada', tipo: 'biologia' })
    ));
  });

  test('muestra el error del backend y permite descartarlo', async () => {
    mockOnGuardar.mockRejectedValue({ response: { data: { error: 'Ya existe esa actividad' } } });

    renderForm({ actividad: actividadExistente });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Ya existe esa actividad')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(screen.queryByText('Ya existe esa actividad')).not.toBeInTheDocument();
  });

  test('usa un mensaje genérico si el error no trae detalle', async () => {
    mockOnGuardar.mockRejectedValue(new Error('Network Error'));

    renderForm({ actividad: actividadExistente });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Error al guardar la actividad.')).toBeInTheDocument();
  });

  test('avisa mientras guarda', async () => {
    let resolver;
    mockOnGuardar.mockReturnValue(new Promise((r) => { resolver = r; }));

    renderForm({ actividad: actividadExistente });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByRole('button', { name: 'Guardando...' })).toBeDisabled();

    resolver({});
    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled());
  });

  test('Cancelar cierra el modal', () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(mockOnCerrar).toHaveBeenCalledTimes(1);
  });
});
