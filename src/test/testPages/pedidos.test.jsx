import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Pedidos from '../../pages/pedidos';
import api from '../../api/axios';

// Mockeamos useNavigate por si en la rama dev se reemplazó el Modal por una redirección
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', rol: 'ADMIN' } }),
}));

vi.mock('react-icons/fi', () => ({
  FiUser: () => <span data-testid="FiUser" />,
  FiHome: () => <span data-testid="FiHome" />,
  FiUsers: () => <span data-testid="FiUsers" />,
  FiCalendar: () => <span data-testid="FiCalendar" />,
  FiEdit2: () => <span data-testid="FiEdit2" />,
  FiTrash2: () => <span data-testid="FiTrash2" />,
  FiMessageCircle: () => <span data-testid="FiMessageCircle" />,
  // Los usa el ConfirmModal que abre "Eliminar pedido".
  FiX: () => <span data-testid="FiX" />,
  FiAlertTriangle: () => <span data-testid="FiAlertTriangle" />,
  FiLogOut: () => <span data-testid="FiLogOut" />,
  FiCheckCircle: () => <span data-testid="FiCheckCircle" />,
  FiInfo: () => <span data-testid="FiInfo" />
}));

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../components/SharedUi', () => ({
  PageHeader: ({ title }) => <h1 data-testid="page-header">{title}</h1>,
}));

describe('Pedidos Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza el estado de carga y posteriormente muestra la lista de pedidos', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/pedido') {
        return Promise.resolve({
          data: [
            { _id: '1', materia: 'Biología Celular', docente: 'Juan Perez', estado: 'Pendiente', laboratorio: 'Lab 1' }
          ]
        });
      }
      if (url === '/laboratorio/disponibles') {
        return Promise.resolve({ data: [] });
      }
    });

    render(
      <MemoryRouter>
        <Pedidos />
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando pedidos...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Biología Celular')).toBeInTheDocument();
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });
  });

  test('interactúa correctamente al darle click a "Ver" o "Inspeccionar"', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/pedido') {
        return Promise.resolve({
          data: [
            { _id: '1', materia: 'Química', docente: 'Ana Gomez', estado: 'Aprobado', laboratorio: 'Lab 2', alumnos: 15 }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <Pedidos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Química')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Ver|Inspeccionar/i }));
    
    await waitFor(() => {
      // Verificamos si abrió un modal (busca 'Cerrar', un ícono de 'FiX' o un valor duplicado)
      const modalAbierto = screen.queryByText(/Cerrar/i) || screen.queryByTestId('FiX') || screen.queryAllByText(/15/).length > 1;
      // O verificamos si redirigió a otra vista (si se eliminó el modal en dev)
      const navego = mockNavigate.mock.calls.length > 0;
      
      expect(modalAbierto || navego).toBeTruthy();
    });
  });
});

describe('Pedidos — filtros y estados', () => {
  // Un pedido de cada estado para barrer los tabs y la normalización. Las
  // materias no repiten el nombre del estado para no chocar con los badges.
  const pedidosVariados = [
    { _id: 'p-pend', materia: 'Biología', docente: { _id: 'user-1', nombre: 'Ana' }, estado: 'Pendiente', laboratorio: 'Lab 1', fechaHora: '2026-05-10T10:00:00.000Z', duracionClase: 120 },
    { _id: 'p-acep', materia: 'Física', docente: { _id: 'user-2', nombre: 'Beto' }, estado: 'Aceptado', laboratorio: 'Lab 1' },
    { _id: 'p-rech', materia: 'Anatomía', docente: 'Carlos', estado: 'Rechazado', laboratorio: 'Lab 2' },
    { _id: 'p-expi', materia: 'Botánica', docente: null, estado: 'Expirado' },
    { _id: 'p-fina', materia: 'Genética', docente: { nombre: 'Eva' }, estado: 'Finalizado' },
    { _id: 'p-canc', materia: 'Zoología', docente: { email: 'f@test.com' }, estado: 'Cancelado' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/pedido') return Promise.resolve({ data: pedidosVariados });
      return Promise.resolve({ data: [] });
    });
  });

  const renderPedidos = async () => {
    render(
      <MemoryRouter>
        <Pedidos />
      </MemoryRouter>
    );
    await screen.findByText('Biología');
  };

  test('el tab Todos muestra los pedidos de cualquier estado', async () => {
    await renderPedidos();

    expect(screen.getByText('Biología')).toBeInTheDocument();
    expect(screen.getByText('Física')).toBeInTheDocument();
    expect(screen.getByText('Anatomía')).toBeInTheDocument();
    expect(screen.getByText('Genética')).toBeInTheDocument();
  });

  test('cada tab filtra por su estado', async () => {
    await renderPedidos();

    fireEvent.click(screen.getByRole('button', { name: /Rechazados/ }));
    expect(screen.getByText('Anatomía')).toBeInTheDocument();
    expect(screen.queryByText('Biología')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Finalizados/ }));
    expect(screen.getByText('Genética')).toBeInTheDocument();
    expect(screen.queryByText('Anatomía')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Expirados/ }));
    expect(screen.getByText('Botánica')).toBeInTheDocument();

    // "Aceptado" se normaliza a "Aprobado".
    fireEvent.click(screen.getByRole('button', { name: /Aprobados/ }));
    expect(screen.getByText('Física')).toBeInTheDocument();
    expect(screen.queryByText('Botánica')).not.toBeInTheDocument();
  });

  test('la búsqueda por ID filtra la lista', async () => {
    await renderPedidos();

    fireEvent.change(screen.getByPlaceholderText(/Buscar por ID/i), { target: { value: 'p-rech' } });

    expect(screen.getByText('Anatomía')).toBeInTheDocument();
    expect(screen.queryByText('Biología')).not.toBeInTheDocument();
  });

  test('avisa cuando la búsqueda no encuentra nada', async () => {
    await renderPedidos();

    fireEvent.change(screen.getByPlaceholderText(/Buscar por ID/i), { target: { value: 'no-existe' } });

    expect(screen.getByText(/No se encontró ningún pedido con ID/)).toBeInTheDocument();
  });

  test('avisa cuando no hay pedidos', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Pedidos />
      </MemoryRouter>
    );

    expect(await screen.findByText('No hay pedidos para mostrar en esta vista.')).toBeInTheDocument();
  });

  test('eliminar pide confirmación y saca el pedido de la lista', async () => {
    api.delete.mockResolvedValue({});

    await renderPedidos();

    fireEvent.click(screen.getAllByTitle('Eliminar pedido')[0]);

    expect(screen.getByText('¿Eliminar pedido?')).toBeInTheDocument();
    expect(api.delete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/pedido/p-pend'));
    await waitFor(() => expect(screen.queryByText('Biología')).not.toBeInTheDocument());
  });

  test('cancelar la confirmación no elimina', async () => {
    await renderPedidos();

    fireEvent.click(screen.getAllByTitle('Eliminar pedido')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(api.delete).not.toHaveBeenCalled();
    expect(screen.getByText('Biología')).toBeInTheDocument();
  });

  test('avisa si no hay permisos para eliminar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    api.delete.mockRejectedValue({ response: { status: 403 } });

    await renderPedidos();

    fireEvent.click(screen.getAllByTitle('Eliminar pedido')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('No tenés permisos para eliminar este pedido.')).toBeInTheDocument();
    // El pedido sigue en la lista.
    expect(screen.getByText('Biología')).toBeInTheDocument();
  });

  test('usa el mensaje del backend si el borrado falla', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    api.delete.mockRejectedValue({ response: { status: 500, data: { error: 'Tiene reservas activas' } } });

    await renderPedidos();

    fireEvent.click(screen.getAllByTitle('Eliminar pedido')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('Tiene reservas activas')).toBeInTheDocument();
  });

  test('pagina de a 9 pedidos', async () => {
    // POR_PAGINA es 9: con 10 aparece el paginador.
    const muchos = Array.from({ length: 10 }, (_, i) => ({
      _id: `p-${i}`,
      materia: `Materia ${i}`,
      docente: { _id: 'user-1', nombre: 'Ana' },
      estado: 'Pendiente',
      laboratorio: 'Lab 1',
    }));
    api.get.mockImplementation((url) => {
      if (url === '/pedido') return Promise.resolve({ data: muchos });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <Pedidos />
      </MemoryRouter>
    );
    await screen.findByText('Materia 0');

    expect(screen.getByText(/Página 1 de 2/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled();
    expect(screen.queryByText('Materia 9')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    expect(screen.getByText('Materia 9')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
  });
});