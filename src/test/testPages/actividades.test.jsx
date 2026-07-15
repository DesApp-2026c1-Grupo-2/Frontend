import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Actividades from '../../pages/actividades';
import {
  getActividades,
  createActividad,
  updateActividad,
  deleteActividad,
} from '../../services/actividadService';

vi.mock('../../services/actividadService', () => ({
  getActividades: vi.fn(),
  createActividad: vi.fn(),
  updateActividad: vi.fn(),
  deleteActividad: vi.fn(),
}));

vi.mock('../../components/SharedUi', () => ({
  PageHeader: ({ title }) => <h1>{title}</h1>,
}));

// El factory se hoistea: el usuario vive en un objeto mutable para variar el rol.
const auth = vi.hoisted(() => ({ user: { id: 'u-1', rol: 'ADMIN' } }));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: auth.user }),
}));

const actividades = [
  { _id: 'a-1', nombre: 'Titulación', tipo: 'quimica', estado: 'planificada', fecha: '2026-05-10T00:00:00.000Z' },
  { _id: 'a-2', nombre: 'Disección', tipo: 'biologia', estado: 'en_proceso', fecha: '2026-05-11T00:00:00.000Z' },
  { _id: 'a-3', nombre: 'Teoría', tipo: 'teorica', estado: 'finalizada', fecha: null },
  { _id: 'a-4', nombre: 'Rara', tipo: 'otro', estado: 'desconocido', fecha: '2026-05-12T00:00:00.000Z' },
];

describe('Actividades Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.user = { id: 'u-1', rol: 'ADMIN' };
    getActividades.mockResolvedValue(actividades);
    createActividad.mockResolvedValue({});
    updateActividad.mockResolvedValue({});
    deleteActividad.mockResolvedValue({});
  });

  const renderPage = async () => {
    const utils = render(<Actividades />);
    await waitFor(() => expect(screen.queryByText('Cargando actividades...')).not.toBeInTheDocument());
    return utils;
  };

  test('muestra la carga y luego la lista', async () => {
    render(<Actividades />);

    expect(screen.getByText('Cargando actividades...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Cargando actividades...')).not.toBeInTheDocument());

    expect(screen.getByText('Titulación')).toBeInTheDocument();
    expect(screen.getByText('Disección')).toBeInTheDocument();
  });

  test('muestra las etiquetas de tipo y estado, y las crudas si no están en el mapa', async () => {
    await renderPage();

    expect(screen.getByText('Química')).toBeInTheDocument();
    expect(screen.getByText('Planificada')).toBeInTheDocument();
    // Tipo y estado fuera del mapa se muestran tal cual.
    expect(screen.getByText('otro')).toBeInTheDocument();
    expect(screen.getByText('desconocido')).toBeInTheDocument();
  });

  test('una actividad sin fecha muestra un guion', async () => {
    await renderPage();

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('los tabs filtran la lista', async () => {
    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Planificadas/ }));
    expect(screen.getByText('Titulación')).toBeInTheDocument();
    expect(screen.queryByText('Disección')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Finalizadas/ }));
    expect(screen.getByText('Teoría')).toBeInTheDocument();
    expect(screen.queryByText('Titulación')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    expect(screen.getByText('Titulación')).toBeInTheDocument();
  });

  test('avisa cuando no hay actividades en la vista', async () => {
    getActividades.mockResolvedValue([]);

    await renderPage();

    expect(screen.getByText('Sin actividades')).toBeInTheDocument();
    expect(screen.getByText('No hay actividades para mostrar en esta vista.')).toBeInTheDocument();
  });

  test('el DOCENTE no puede crear ni editar', async () => {
    auth.user = { id: 'u-2', rol: 'DOCENTE' };

    await renderPage();

    expect(screen.queryByText('+ Nueva actividad')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Editar actividad')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar actividad')).not.toBeInTheDocument();
  });

  test('crea una actividad nueva y recarga la lista', async () => {
    await renderPage();

    fireEvent.click(screen.getByText('+ Nueva actividad'));
    expect(screen.getByText('Nueva actividad')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Ej. Práctica de titulación'), {
      target: { value: 'Nueva práctica' },
    });
    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: '2026-06-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear actividad' }));

    await waitFor(() => expect(createActividad).toHaveBeenCalledWith({
      nombre: 'Nueva práctica',
      tipo: 'quimica',
      fecha: '2026-06-01',
      estado: 'planificada',
    }));
    // Tras guardar se refresca el listado.
    await waitFor(() => expect(getActividades).toHaveBeenCalledTimes(2));
  });

  test('edita una actividad existente', async () => {
    await renderPage();

    fireEvent.click(screen.getAllByTitle('Editar actividad')[0]);
    expect(screen.getByText('Editar actividad')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Titulación')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Titulación'), { target: { value: 'Titulación v2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(updateActividad).toHaveBeenCalledWith(
      'a-1',
      expect.objectContaining({ nombre: 'Titulación v2' })
    ));
  });

  test('eliminar pide confirmación y saca la actividad de la lista', async () => {
    await renderPage();

    fireEvent.click(screen.getAllByTitle('Eliminar actividad')[0]);

    expect(screen.getByText('¿Eliminar actividad?')).toBeInTheDocument();
    expect(deleteActividad).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }));

    await waitFor(() => expect(deleteActividad).toHaveBeenCalledWith('a-1'));
    await waitFor(() => expect(screen.queryByText('Titulación')).not.toBeInTheDocument());
  });

  test('cancelar la confirmación no elimina', async () => {
    await renderPage();

    fireEvent.click(screen.getAllByTitle('Eliminar actividad')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(deleteActividad).not.toHaveBeenCalled();
    expect(screen.getByText('Titulación')).toBeInTheDocument();
  });

  test('muestra el error si falla el borrado', async () => {
    deleteActividad.mockRejectedValue({ response: { data: { error: 'Tiene reservas asociadas' } } });

    await renderPage();

    fireEvent.click(screen.getAllByTitle('Eliminar actividad')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }));

    expect(await screen.findByText('Tiene reservas asociadas')).toBeInTheDocument();
    // La actividad sigue en la lista.
    expect(screen.getByText('Titulación')).toBeInTheDocument();
  });

  test('usa un mensaje genérico si el borrado falla sin detalle', async () => {
    deleteActividad.mockRejectedValue(new Error('Network Error'));

    await renderPage();

    fireEvent.click(screen.getAllByTitle('Eliminar actividad')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }));

    expect(await screen.findByText('No se pudo eliminar la actividad.')).toBeInTheDocument();
  });

  test('no rompe si falla la carga', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getActividades.mockRejectedValue(new Error('Network Error'));

    await renderPage();

    expect(screen.getByText('Sin actividades')).toBeInTheDocument();
  });
});
