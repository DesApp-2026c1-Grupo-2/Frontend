import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Pedidos from '../../pages/pedidos';
import api from '../../api/axios';

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
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

  test('abre un modal para ver detalles al darle click a "Ver"', async () => {
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

    fireEvent.click(screen.getByText('Ver'));
    
    // Como el valor '15' está en la tabla y ahora también en el modal, usamos getAllByText
    const elementosAlumnos = screen.getAllByText('15');
    expect(elementosAlumnos.length).toBe(2); // Uno en la tabla, otro en el modal
    expect(screen.getByText('Cerrar')).toBeInTheDocument(); // Confirmamos que el modal se abrió
  });
});