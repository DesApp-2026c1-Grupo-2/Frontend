import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FormularioTransferirLote from '../../components/equipamiento/FormularioTransferirLote';
import { obtenerEdificios } from '../../services/edificioService';
import { obtenerLaboratoriosPorEdificio } from '../../services/laboratorioService';

vi.mock('../../services/edificioService', () => ({
  obtenerEdificios: vi.fn(),
}));

vi.mock('../../services/laboratorioService', () => ({
  obtenerLaboratoriosPorEdificio: vi.fn(),
}));

// Lote que ya está en el depósito: el destino natural es un laboratorio.
const loteEnDeposito = { _id: 'lote-1', cantidad: 10 };

// Lote asignado a un laboratorio: habilita devolverlo al depósito.
const loteEnLaboratorio = { _id: 'lote-2', cantidad: 1, laboratorioId: 'lab-1', ubicacionLote: 'Lab Química' };

describe('FormularioTransferirLote Component', () => {
  const mockOnSubmit = vi.fn();
  const mockCerrarModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    obtenerEdificios.mockResolvedValue([
      { id: 'edif-1', nombre: 'Edificio A' },
      { id: 'edif-2', nombre: 'Edificio Baja', estado: false },
    ]);
    obtenerLaboratoriosPorEdificio.mockResolvedValue([
      { id: 'lab-1', nombre: 'Lab Química', tipo: 'quimica', capacidad: 30 },
      { id: 'lab-borrado', nombre: 'Lab Viejo', tipo: 'fisica', capacidad: 10, estado: 'eliminado' },
    ]);
  });

  const renderForm = (props = {}) =>
    render(
      <FormularioTransferirLote
        lote={loteEnDeposito}
        onSubmit={mockOnSubmit}
        cerrarModal={mockCerrarModal}
        {...props}
      />
    );

  // El CustomSelect solo renderiza sus opciones cuando está abierto, y el
  // handler vive en el <button> de adentro del <li role="option">.
  const abrirSelect = (textoTrigger) => {
    fireEvent.click(screen.getByText(textoTrigger));
  };

  const elegirOpcion = async (nombre) => {
    const opcion = await screen.findByRole('option', { name: nombre });
    fireEvent.click(within(opcion).getByRole('button'));
  };

  const elegirEdificio = async () => {
    abrirSelect('Seleccionar edificio');
    await elegirOpcion('Edificio A');
  };

  const elegirLaboratorio = async () => {
    // Esperar a que termine la carga en cascada (el trigger deja de decir "Cargando...").
    fireEvent.click(await screen.findByText('Seleccionar laboratorio'));
    await elegirOpcion(/Lab Química/);
  };

  test('un lote en depósito arranca en modo laboratorio y carga los edificios', async () => {
    renderForm();

    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    expect(screen.getByText('Trasladar a un laboratorio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Depósito · 10 disponibles')).toBeInTheDocument();
  });

  test('no ofrece devolver al depósito si el lote ya está ahí', async () => {
    renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Trasladar a un laboratorio'));

    expect(screen.queryByRole('option', { name: 'Devolver al depósito' })).not.toBeInTheDocument();
  });

  test('descarta los edificios dados de baja y los laboratorios eliminados', async () => {
    renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    abrirSelect('Seleccionar edificio');
    expect(screen.queryByRole('option', { name: 'Edificio Baja' })).not.toBeInTheDocument();
    await elegirOpcion('Edificio A');

    await waitFor(() => expect(obtenerLaboratoriosPorEdificio).toHaveBeenCalledWith('edif-1'));
    abrirSelect('Seleccionar laboratorio');
    expect(screen.queryByRole('option', { name: /Lab Viejo/ })).not.toBeInTheDocument();
  });

  test('elegir un edificio carga sus laboratorios en cascada', async () => {
    renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    // Sin edificio, el select de laboratorio está bloqueado.
    expect(screen.getByText('Elegí un edificio primero')).toBeInTheDocument();

    await elegirEdificio();

    await waitFor(() => expect(obtenerLaboratoriosPorEdificio).toHaveBeenCalledWith('edif-1'));
    expect(await screen.findByText('Seleccionar laboratorio')).toBeInTheDocument();
  });

  test('exige elegir un laboratorio destino', async () => {
    renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Mover lote' }));

    expect(await screen.findByText('Elegí un laboratorio destino.')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('traslada el lote completo cuando no se indica cantidad', async () => {
    renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    await elegirEdificio();
    await elegirLaboratorio();

    fireEvent.click(screen.getByRole('button', { name: 'Mover lote' }));

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith({
      laboratorioDestinoId: 'lab-1',
      cantidad: undefined,
      observacion: undefined,
    }));
  });

  test('envía cantidad y observación en un traslado parcial', async () => {
    renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    await elegirEdificio();
    await elegirLaboratorio();

    fireEvent.change(screen.getByPlaceholderText('Máximo 10'), { target: { value: '3' } });
    fireEvent.change(screen.getByPlaceholderText('Motivo o detalle del traslado...'), {
      target: { value: '  traslado por obra  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Mover lote' }));

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith({
      laboratorioDestinoId: 'lab-1',
      cantidad: 3,
      observacion: 'traslado por obra',
    }));
  });

  // El input tiene min/max, así que la validación nativa del navegador ya frena
  // estos valores; se envía el form directo para ejercitar la validación propia.
  test('rechaza una cantidad no entera o menor a 1', async () => {
    const { container } = renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    await elegirEdificio();
    await elegirLaboratorio();

    fireEvent.change(screen.getByPlaceholderText('Máximo 10'), { target: { value: '1.5' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('Ingresá un entero mayor a 0.')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('rechaza una cantidad mayor a la disponible', async () => {
    const { container } = renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    await elegirEdificio();
    await elegirLaboratorio();

    fireEvent.change(screen.getByPlaceholderText('Máximo 10'), { target: { value: '11' } });
    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText('No puede superar la cantidad disponible (10).')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('un lote en laboratorio arranca devolviéndose al depósito y no carga edificios', async () => {
    renderForm({ lote: loteEnLaboratorio });

    expect(screen.getByText('Devolver al depósito')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lab Química · 1 disponible')).toBeInTheDocument();
    expect(obtenerEdificios).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Mover lote' }));

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledWith({
      laboratorioDestinoId: null,
      cantidad: undefined,
      observacion: undefined,
    }));
  });

  test('avisa si no se pudieron cargar los edificios', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    obtenerEdificios.mockRejectedValue(new Error('Network Error'));

    renderForm();

    expect(await screen.findByText('No se pudieron cargar los edificios.')).toBeInTheDocument();
  });

  test('avisa si no se pudieron cargar los laboratorios del edificio', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    obtenerLaboratoriosPorEdificio.mockRejectedValue(new Error('Network Error'));

    renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    await elegirEdificio();

    expect(
      await screen.findByText('No se pudieron cargar los laboratorios de ese edificio.')
    ).toBeInTheDocument();
  });

  test('el botón Cancelar cierra el modal', async () => {
    renderForm();
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(mockCerrarModal).toHaveBeenCalledTimes(1);
  });

  test('mientras envía deshabilita los botones y avisa', async () => {
    renderForm({ enviando: true });
    await waitFor(() => expect(obtenerEdificios).toHaveBeenCalled());

    expect(screen.getByRole('button', { name: 'Moviendo...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
