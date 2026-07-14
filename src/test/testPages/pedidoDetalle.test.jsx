import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PedidoDetalle from '../../pages/pedidoDetalle';
import api from '../../api/axios';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'pedido-1' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

// Pedido Aceptado con un consumible populado (esConsumible true).
const pedidoAceptado = {
  _id: 'pedido-1',
  materia: 'Química',
  estado: 'Aceptado',
  alumnos: 10,
  recursos: [
    {
      recursoId: { _id: 'item-1', nombre: 'Alcohol etílico', tipo: 'reactivo', esConsumible: true },
      tipoRecurso: 'Item',
      cantidad: 10,
    },
  ],
  historial: [],
  comentarios: [],
};

const finalizarConsumos = async () => {
  // Abrir el form de finalización.
  fireEvent.click(await screen.findByRole('button', { name: /Finalizar Pedido/i }));
  // Confirmar.
  fireEvent.click(await screen.findByRole('button', { name: /Confirmar Finalización/i }));
  const finalizarCall = await waitFor(() => {
    const call = api.patch.mock.calls.find(([url]) => url === '/pedido/pedido-1/finalizar');
    expect(call).toBeTruthy();
    return call;
  });
  return finalizarCall[1];
};

describe('PedidoDetalle — finalización con consumos[]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: pedidoAceptado });
    api.patch.mockResolvedValue({ data: { pedido: { ...pedidoAceptado, estado: 'Finalizado' } } });
  });

  test('omitir el reporte de consumo envía consumos vacío (consumo total por default)', async () => {
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );

    const payload = await finalizarConsumos();
    expect(payload.consumos).toEqual([]);
  });

  test('reportar consumo real incluye el item en consumos[]', async () => {
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );

    // Abrir el form.
    fireEvent.click(await screen.findByRole('button', { name: /Finalizar Pedido/i }));

    // Marcar "Reportar consumo real".
    const checkConsumo = await screen.findByLabelText(/Reportar consumo real/i);
    fireEvent.click(checkConsumo);

    // Ingresar la cantidad consumida (6 de 10 → devuelve 4).
    const inputConsumo = screen.getByPlaceholderText(/Consumido de 10/i);
    fireEvent.change(inputConsumo, { target: { value: '6' } });

    // Confirmar.
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Finalización/i }));

    const payload = await waitFor(() => {
      const call = api.patch.mock.calls.find(([url]) => url === '/pedido/pedido-1/finalizar');
      expect(call).toBeTruthy();
      return call[1];
    });

    expect(payload.consumos).toEqual([{ itemId: 'item-1', cantidadConsumida: 6 }]);
  });
});

// Pedido Aceptado con un reutilizable populado (esConsumible false).
const pedidoReutilizable = {
  _id: 'pedido-1',
  materia: 'Química',
  estado: 'Aceptado',
  alumnos: 10,
  recursos: [
    {
      recursoId: { _id: 'item-2', nombre: 'Matraz Erlenmeyer', tipo: 'material', esConsumible: false },
      tipoRecurso: 'Item',
      cantidad: 5,
    },
  ],
  historial: [],
  comentarios: [],
};

describe('PedidoDetalle — descartes solo para reutilizables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.patch.mockResolvedValue({ data: { pedido: { estado: 'Finalizado' } } });
  });

  test('el consumible no ofrece descarte, solo consumo', async () => {
    api.get.mockResolvedValue({ data: pedidoAceptado });
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /Finalizar Pedido/i }));

    expect(await screen.findByLabelText(/Reportar consumo real/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Registrar descarte/i)).toBeNull();
  });

  test('el reutilizable ofrece descarte y lo envía en descartes[]', async () => {
    api.get.mockResolvedValue({ data: pedidoReutilizable });
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /Finalizar Pedido/i }));

    // El reutilizable muestra descarte y no muestra consumo.
    const checkDescarte = await screen.findByLabelText(/Registrar descarte/i);
    expect(screen.queryByLabelText(/Reportar consumo real/i)).toBeNull();

    fireEvent.click(checkDescarte);
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Finalización/i }));

    const payload = await waitFor(() => {
      const call = api.patch.mock.calls.find(([url]) => url === '/pedido/pedido-1/finalizar');
      expect(call).toBeTruthy();
      return call[1];
    });

    expect(payload.descartes).toEqual([
      { tipo: 'material', itemId: 'item-2', cantidad: 5, motivo: 'Finalización de pedido' },
    ]);
    expect(payload.consumos).toEqual([]);
  });
});
