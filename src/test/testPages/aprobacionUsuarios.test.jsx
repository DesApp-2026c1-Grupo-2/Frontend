import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import AprobacionUsuarios from '../../pages/aprobacionUsuarios';
import {
  obtenerUsuariosPendientes,
  obtenerUsuarios,
  aprobarUsuario,
  rechazarUsuario,
} from '../../services/usuarioService';

vi.mock('../../services/usuarioService', () => ({
  obtenerUsuariosPendientes: vi.fn(),
  obtenerUsuarios: vi.fn(),
  aprobarUsuario: vi.fn(),
  rechazarUsuario: vi.fn(),
}));

vi.mock('../../components/SharedUi', () => ({
  PageHeader: ({ title }) => <h1>{title}</h1>,
}));

// La página no usa useAuth: el acceso lo restringe RoleProtectedRoute.

const pendientes = [
  {
    _id: 'u-1',
    nombre: 'Ana',
    apellido: 'Pérez',
    email: 'ana@test.com',
    rol: 'DOCENTE',
    legajo: '123',
    estado: 'PENDIENTE',
    createdAt: '2026-05-10T10:00:00.000Z',
  },
  {
    id: 'u-2', // el backend puede mandar id en vez de _id
    nombre: 'Beto',
    apellido: 'Gómez',
    email: 'beto@test.com',
    rol: 'DOCENTE',
    estado: 'PENDIENTE',
    createdAt: null,
  },
];

describe('AprobacionUsuarios Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    obtenerUsuariosPendientes.mockResolvedValue({ total: 2, page: 1, limit: 12, usuarios: pendientes });
    obtenerUsuarios.mockResolvedValue({ total: 5, page: 1, limit: 12, usuarios: pendientes });
    aprobarUsuario.mockResolvedValue({});
    rechazarUsuario.mockResolvedValue({});
  });

  const renderPage = async () => {
    const utils = render(<AprobacionUsuarios />);
    await waitFor(() => expect(screen.queryByText('Cargando usuarios...')).not.toBeInTheDocument());
    return utils;
  };

  test('muestra la carga, los pendientes y los indicadores', async () => {
    render(<AprobacionUsuarios />);

    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Cargando usuarios...')).not.toBeInTheDocument());

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
    // Activos = total de usuarios - pendientes.
    expect(screen.getByText('Activos')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('muestra el legajo solo si el usuario lo tiene', async () => {
    await renderPage();

    expect(screen.getByText(/Legajo:\s*123/)).toBeInTheDocument();
    // Beto no tiene legajo, y sin fecha de registro se muestra un guion.
    expect(screen.getAllByText(/Legajo:/).length).toBe(1);
    expect(screen.getByText(/Registrado:\s*—/)).toBeInTheDocument();
  });

  test('el tab Todos consulta el padrón completo', async () => {
    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Todos' }));

    await waitFor(() => expect(obtenerUsuarios).toHaveBeenCalledWith({ page: 1, limit: 12 }));
  });

  test('clickear el tab activo no vuelve a consultar', async () => {
    await renderPage();

    const llamadasPrevias = obtenerUsuariosPendientes.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: /Pendientes/ }));

    expect(obtenerUsuariosPendientes.mock.calls.length).toBe(llamadasPrevias);
  });

  test('la búsqueda filtra por nombre y por email', async () => {
    await renderPage();

    const buscador = screen.getByPlaceholderText('Buscar en esta página...');

    fireEvent.change(buscador, { target: { value: 'beto' } });
    expect(screen.getByText('Beto Gómez')).toBeInTheDocument();
    expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument();

    fireEvent.change(buscador, { target: { value: 'ana@test' } });
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.queryByText('Beto Gómez')).not.toBeInTheDocument();
  });

  test('avisa cuando la búsqueda no encuentra nada', async () => {
    await renderPage();

    fireEvent.change(screen.getByPlaceholderText('Buscar en esta página...'), {
      target: { value: 'zzz' },
    });

    expect(screen.getByText('No se encontraron usuarios en esta página.')).toBeInTheDocument();
  });

  test('avisa cuando no hay pendientes', async () => {
    obtenerUsuariosPendientes.mockResolvedValue({ total: 0, page: 1, limit: 12, usuarios: [] });

    await renderPage();

    expect(screen.getByText('No hay usuarios pendientes de aprobación.')).toBeInTheDocument();
  });

  test('aprobar pide confirmación y recarga', async () => {
    await renderPage();

    fireEvent.click(screen.getAllByTitle('Aprobar usuario')[0]);

    expect(screen.getByText('¿Aprobar usuario?')).toBeInTheDocument();
    expect(screen.getByText(/Se aprobará la cuenta de Ana Pérez/)).toBeInTheDocument();
    expect(aprobarUsuario).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Sí, aprobar' }));

    await waitFor(() => expect(aprobarUsuario).toHaveBeenCalledWith('u-1'));
  });

  test('rechazar pide confirmación y usa el id que venga', async () => {
    await renderPage();

    // El segundo usuario trae `id` en vez de `_id`.
    fireEvent.click(screen.getAllByTitle('Rechazar usuario')[1]);

    expect(screen.getByText('¿Rechazar usuario?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sí, rechazar' }));

    await waitFor(() => expect(rechazarUsuario).toHaveBeenCalledWith('u-2'));
  });

  test('cancelar la confirmación no ejecuta la acción', async () => {
    await renderPage();

    fireEvent.click(screen.getAllByTitle('Aprobar usuario')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(aprobarUsuario).not.toHaveBeenCalled();
  });

  test('traduce los errores al aprobar', async () => {
    aprobarUsuario.mockRejectedValue({ response: { status: 403 } });

    await renderPage();

    fireEvent.click(screen.getAllByTitle('Aprobar usuario')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Sí, aprobar' }));

    expect(await screen.findByText('No tenés permisos para aprobar usuarios.')).toBeInTheDocument();
  });

  test('avisa si el usuario ya no está pendiente', async () => {
    aprobarUsuario.mockRejectedValue({ response: { status: 409 } });

    await renderPage();

    fireEvent.click(screen.getAllByTitle('Aprobar usuario')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Sí, aprobar' }));

    expect(await screen.findByText('El usuario ya no está pendiente de aprobación.')).toBeInTheDocument();
  });

  test('usa el mensaje del backend si lo hay', async () => {
    aprobarUsuario.mockRejectedValue({ response: { status: 500, data: { error: 'Se cayó el correo' } } });

    await renderPage();

    fireEvent.click(screen.getAllByTitle('Aprobar usuario')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Sí, aprobar' }));

    expect(await screen.findByText('Se cayó el correo')).toBeInTheDocument();
  });

  test('traduce los errores al rechazar', async () => {
    rechazarUsuario.mockRejectedValue({ response: { status: 403 } });

    await renderPage();

    fireEvent.click(screen.getAllByTitle('Rechazar usuario')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Sí, rechazar' }));

    expect(await screen.findByText('No tenés permisos para rechazar usuarios.')).toBeInTheDocument();
  });

  test('un usuario que no está pendiente no ofrece acciones', async () => {
    obtenerUsuariosPendientes.mockResolvedValue({
      total: 1,
      page: 1,
      limit: 12,
      usuarios: [{ _id: 'u-9', nombre: 'Activo', apellido: 'Uno', email: 'a@t.com', rol: 'DOCENTE', estado: 'ACTIVO' }],
    });

    await renderPage();

    expect(screen.queryByTitle('Aprobar usuario')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Rechazar usuario')).not.toBeInTheDocument();
  });

  test('pagina hacia adelante y hacia atrás', async () => {
    obtenerUsuariosPendientes.mockResolvedValue({ total: 30, page: 1, limit: 12, usuarios: pendientes });

    await renderPage();

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    await waitFor(() => expect(obtenerUsuariosPendientes).toHaveBeenLastCalledWith({ page: 2, limit: 12 }));
  });

  test('no rompe si falla la carga inicial', async () => {
    obtenerUsuariosPendientes.mockRejectedValue(new Error('Network Error'));
    obtenerUsuarios.mockRejectedValue(new Error('Network Error'));

    await renderPage();

    expect(screen.getByText('Aprobación de usuarios')).toBeInTheDocument();
  });
});
