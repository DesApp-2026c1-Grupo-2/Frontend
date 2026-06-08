import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Laboratorios from '../../pages/laboratorios';

// 1. Mocks de servicios
import { obtenerLaboratoriosPorEdificio, crearLaboratorio, actualizarEstadoLaboratorio, eliminarLaboratorio } from '../../services/laboratorioService';
import { obtenerEquipos } from '../../services/equipoFijoService';
import { obtenerEdificios } from '../../services/edificioService';

vi.mock('../../services/laboratorioService', () => ({
  obtenerLaboratoriosPorEdificio: vi.fn(),
  crearLaboratorio: vi.fn(),
  actualizarEstadoLaboratorio: vi.fn(),
  eliminarLaboratorio: vi.fn(),
}));

vi.mock('../../services/equipoFijoService', () => ({
  obtenerEquipos: vi.fn(),
}));

vi.mock('../../services/edificioService', () => ({
  obtenerEdificios: vi.fn(),
}));

// 2. Mocks de React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'edificio-1' }),
  };
});

// 3. Mocks de componentes e íconos para aislar la prueba y poder interactuar fácilmente
vi.mock('../../components/SharedUi', () => ({
  PageHeader: ({ title }) => <h1 data-testid="page-header">{title}</h1>
}));

vi.mock('../../components/laboratorios/LaboratorioModal', () => ({
  default: ({ mostrar, cerrarModal, handleSubmit, handleChange, formData }) => {
    if (!mostrar) return null;
    return (
      <div data-testid="mock-modal">
        <input 
          data-testid="input-nombre" 
          name="nombre" 
          value={formData.nombre} 
          onChange={handleChange} 
        />
        <input 
          data-testid="input-checkbox" 
          type="checkbox" 
          name="esActivo" 
          onChange={handleChange} 
        />
        <button onClick={cerrarModal}>Cerrar Modal</button>
        <button onClick={(e) => { e.preventDefault(); handleSubmit(e); }}>Guardar</button>
      </div>
    );
  }
}));

vi.mock('react-icons/fi', () => ({
  FiEdit2: () => <span data-testid="icon-edit">Editar</span>,
  FiTrash2: () => <span data-testid="icon-trash">Eliminar</span>,
  FiUsers: () => <span>FiUsers</span>,
  FiMonitor: () => <span>FiMonitor</span>,
  FiLayers: () => <span>FiLayers</span>,
}));

describe('Laboratorios Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Retornos por defecto exitosos
    obtenerEdificios.mockResolvedValue([{ _id: 'edificio-1', nombre: 'Edificio Central' }]);
    obtenerLaboratoriosPorEdificio.mockResolvedValue([
      { _id: 'lab-1', nombre: 'Lab Química', capacidad: 30, tipo: 'quimica', estado: 'disponible' }
    ]);
    obtenerEquipos.mockResolvedValue([
      { _id: 'eq-1', nombre: 'Microscopio', esFijo: true, laboratorioId: { id: 'lab-1', nombre: 'Lab Química' } }
    ]);

    // Espiamos window.confirm para no bloquear los tests al eliminar
    window.confirm = vi.fn(() => true);
    
    // Espiamos console.error para mantener la terminal limpia durante tests de error
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('muestra estado de carga inicial', () => {
    // Hacemos que la promesa quede en pending para verificar la pantalla de carga
    obtenerEdificios.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <Laboratorios />
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando edificio...')).toBeInTheDocument();
  });

  test('carga y muestra correctamente la vista principal con laboratorios', async () => {
    render(
      <MemoryRouter>
        <Laboratorios />
      </MemoryRouter>
    );

    // Esperar a que se resuelva el edificio
    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toHaveTextContent('Edificio Central');
    });

    // Validar métricas y contenido
    expect(screen.getByText('Lab Química')).toBeInTheDocument();
    expect(screen.getByText('Microscopio')).toBeInTheDocument(); // Equipo asignado
    expect(screen.getByText('Capacidad: 30 personas')).toBeInTheDocument();
  });

  test('muestra un mensaje cuando el edificio no tiene laboratorios', async () => {
    obtenerLaboratoriosPorEdificio.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Laboratorios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Este edificio todavía no tiene laboratorios.')).toBeInTheDocument();
    });
  });

  test('abre el modal, captura cambios de input (handleChange) y permite crear un laboratorio', async () => {
    crearLaboratorio.mockResolvedValue({ _id: 'lab-2', nombre: 'Lab Física', capacidad: 20, tipo: 'fisica', estado: 'disponible' });

    render(
      <MemoryRouter>
        <Laboratorios />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('+ Nuevo laboratorio')).toBeInTheDocument());
    
    // Abrir Modal
    fireEvent.click(screen.getByText('+ Nuevo laboratorio'));
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

    // Simular escritura para cobertura de `handleChange` (input text y checkbox)
    fireEvent.change(screen.getByTestId('input-nombre'), { target: { name: 'nombre', value: 'Lab Física', type: 'text' } });
    fireEvent.click(screen.getByTestId('input-checkbox'));

    // Guardar (crear)
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(crearLaboratorio).toHaveBeenCalled();
      // La UI debe actualizarse mostrando el nuevo lab
      expect(screen.getByText('Lab Física')).toBeInTheDocument();
    });
  });

  test('permite abrir el modal para editar y guardar cambios', async () => {
    actualizarEstadoLaboratorio.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Laboratorios />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Lab Química')).toBeInTheDocument());

    // Abrir Modal de Edición
    fireEvent.click(screen.getByTestId('icon-edit'));
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByTestId('input-nombre')).toHaveValue('Lab Química'); // Verifica que se cargan los datos previos

    // Guardar (editar)
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(actualizarEstadoLaboratorio).toHaveBeenCalledWith('lab-1', expect.any(String));
    });
  });

  test('permite eliminar un laboratorio tras confirmación', async () => {
    eliminarLaboratorio.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Laboratorios />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Lab Química')).toBeInTheDocument());

    // Eliminar
    fireEvent.click(screen.getByTestId('icon-trash'));

    // Verificar confirmación y llamada al backend
    expect(window.confirm).toHaveBeenCalledWith('¿Seguro que querés eliminar este laboratorio?');
    await waitFor(() => {
      expect(eliminarLaboratorio).toHaveBeenCalledWith('lab-1');
      expect(screen.queryByText('Lab Química')).not.toBeInTheDocument();
    });
  });
});