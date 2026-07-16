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

// Reserva con un consumible que ya salió del inventario: hay que reportar su consumo.
const reservaConConsumo = {
  reservaId: 'reserva-1',
  pedidoId: 'pedido-1',
  estado: 'Finalizada',
  requiereReporteConsumo: true,
  materialesReservados: [
    {
      itemId: 'item-1',
      nombre: 'Alcohol etílico',
      cantidadTotal: 10,
      esConsumible: true,
      consumoEjecutado: true,
      liquidado: false,
      requiereConsumo: true,
      cantidadPendiente: 10,
    },
  ],
};

// Misma reserva pero con el stock todavía adentro: no hay nada que reportar.
const reservaSinConsumo = {
  ...reservaConConsumo,
  estado: 'Pendiente',
  requiereReporteConsumo: false,
  materialesReservados: [
    {
      ...reservaConConsumo.materialesReservados[0],
      consumoEjecutado: false,
      requiereConsumo: false,
    },
  ],
};

const error404 = Object.assign(new Error('Not Found'), {
  response: { status: 404, data: { error: 'El pedido no tiene reserva asociada' } },
});

// El mock de api.get tiene que discriminar por URL: el detalle del pedido y la
// reserva se piden al mismo mock. `reserva` acepta un objeto, o un error a rechazar.
const mockGets = ({ pedido = pedidoAceptado, reserva = reservaSinConsumo } = {}) => {
  api.get.mockImplementation((url) => {
    if (url === '/pedido/pedido-1') return Promise.resolve({ data: pedido });
    if (url === '/reservas/pedido/pedido-1') {
      return reserva instanceof Error ? Promise.reject(reserva) : Promise.resolve({ data: reserva });
    }
    return Promise.resolve({ data: {} });
  });
};

describe('PedidoDetalle — finalización con consumos[]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGets({ reserva: reservaConConsumo });
    api.patch.mockResolvedValue({ data: { pedido: { ...pedidoAceptado, estado: 'Finalizado' } } });
  });

  const abrirFormulario = async () => {
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );
    fireEvent.click(await screen.findByRole('button', { name: /Finalizar Pedido/i }));
  };

  const confirmar = async () => {
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Finalización/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Sí, finalizar/i }));
    return waitFor(() => {
      const call = api.patch.mock.calls.find(([url]) => url === '/pedido/pedido-1/finalizar');
      expect(call).toBeTruthy();
      return call[1];
    });
  };

  test('no deja finalizar sin reportar el consumo de un item requerido', async () => {
    await abrirFormulario();

    // El input existe pero está vacío: confirmar tiene que estar bloqueado.
    expect(await screen.findByLabelText(/Cantidad consumida de Alcohol etílico/i)).toHaveValue(null);
    expect(screen.getByRole('button', { name: /Confirmar Finalización/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Finalización/i }));

    expect(api.patch.mock.calls.some(([url]) => url === '/pedido/pedido-1/finalizar')).toBe(false);
  });

  test('reportar consumo real incluye el item en consumos[]', async () => {
    await abrirFormulario();

    // 6 de 10 → devuelve 4 al stock.
    fireEvent.change(await screen.findByLabelText(/Cantidad consumida de Alcohol etílico/i), {
      target: { value: '6' },
    });

    const payload = await confirmar();

    expect(payload.consumos).toEqual([{ itemId: 'item-1', cantidadConsumida: 6 }]);
  });

  test('reportar 0 se envía como 0 y no como item omitido', async () => {
    await abrirFormulario();

    fireEvent.change(await screen.findByLabelText(/Cantidad consumida de Alcohol etílico/i), {
      target: { value: '0' },
    });

    const payload = await confirmar();

    expect(payload.consumos).toEqual([{ itemId: 'item-1', cantidadConsumida: 0 }]);
  });

  test('los itemId salen de la reserva y no de pedido.recursos', async () => {
    // El id del catálogo en el pedido difiere del de la reserva: gana el de la reserva.
    mockGets({
      reserva: {
        ...reservaConConsumo,
        materialesReservados: [
          { ...reservaConConsumo.materialesReservados[0], itemId: 'item-de-reserva' },
        ],
      },
    });

    await abrirFormulario();
    fireEvent.change(await screen.findByLabelText(/Cantidad consumida de Alcohol etílico/i), {
      target: { value: '3' },
    });

    const payload = await confirmar();

    expect(payload.consumos).toEqual([{ itemId: 'item-de-reserva', cantidadConsumida: 3 }]);
  });

  test('pide el consumo de un item que ya no está en pedido.recursos', async () => {
    // Si los recursos se editaron después de aprobar, el item puede faltar del pedido
    // pero seguir exigiendo reporte: igual tiene que poder reportarse.
    mockGets({
      pedido: { ...pedidoAceptado, recursos: [] },
      reserva: reservaConConsumo,
    });

    await abrirFormulario();
    fireEvent.change(await screen.findByLabelText(/Cantidad consumida de Alcohol etílico/i), {
      target: { value: '2' },
    });

    const payload = await confirmar();

    expect(payload.consumos).toEqual([{ itemId: 'item-1', cantidadConsumida: 2 }]);
  });

  test('no pide nada si la reserva no requiere reporte', async () => {
    mockGets({ reserva: reservaSinConsumo });

    await abrirFormulario();

    expect(await screen.findByText(/No hay consumibles pendientes/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Cantidad consumida/i)).toBeNull();

    const payload = await confirmar();
    expect(payload.consumos).toEqual([]);
  });

  test('un pedido sin reserva (404) se finaliza sin reportar consumos', async () => {
    mockGets({ reserva: error404 });

    await abrirFormulario();
    // Hay que esperar a que cargue: mientras tanto confirmar está bloqueado.
    await screen.findByText(/No hay consumibles pendientes/i);

    const payload = await confirmar();
    expect(payload.consumos).toEqual([]);
  });

  test('bloquea la finalización si no se puede cargar la reserva', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGets({ reserva: Object.assign(new Error('Boom'), { response: { status: 500 } }) });

    await abrirFormulario();

    expect(await screen.findByText(/No se pudo cargar el detalle de la reserva/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar Finalización/i })).toBeDisabled();
  });

  test('valida que el consumo no supere la cantidad pendiente', async () => {
    await abrirFormulario();

    fireEvent.change(await screen.findByLabelText(/Cantidad consumida de Alcohol etílico/i), {
      target: { value: '15' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Finalización/i }));

    expect(await screen.findByText('El máximo es 10.')).toBeInTheDocument();
    expect(api.patch.mock.calls.some(([url]) => url === '/pedido/pedido-1/finalizar')).toBe(false);
  });

  test('muestra el error de negocio del backend y deja el form abierto', async () => {
    api.patch.mockImplementation((url) => {
      if (url === '/pedido/pedido-1/finalizar') {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: 'Debe indicar la cantidad consumida de los siguientes consumibles para finalizar: Alcohol etílico.' },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    await abrirFormulario();
    fireEvent.change(await screen.findByLabelText(/Cantidad consumida de Alcohol etílico/i), {
      target: { value: '4' },
    });
    await confirmar();

    expect(await screen.findByText(/Debe indicar la cantidad consumida/i)).toBeInTheDocument();
    // El form sigue abierto para corregir y reintentar.
    expect(screen.getByLabelText(/Cantidad consumida de Alcohol etílico/i)).toBeInTheDocument();
  });

  test('mapea el error de validación de Joi al input del item', async () => {
    api.patch.mockImplementation((url) => {
      if (url === '/pedido/pedido-1/finalizar') {
        return Promise.reject({
          response: {
            status: 400,
            data: {
              error: 'Error de validación',
              detalles: [{ message: 'cantidadConsumida es obligatoria', path: ['consumos', 0, 'cantidadConsumida'] }],
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    await abrirFormulario();
    fireEvent.change(await screen.findByLabelText(/Cantidad consumida de Alcohol etílico/i), {
      target: { value: '4' },
    });
    await confirmar();

    expect(await screen.findByText('cantidadConsumida es obligatoria')).toBeInTheDocument();
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
    mockGets({ pedido: pedidoAceptado, reserva: reservaConConsumo });
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /Finalizar Pedido/i }));

    expect(await screen.findByLabelText(/Cantidad consumida de Alcohol etílico/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Registrar descarte/i)).toBeNull();
  });

  test('el reutilizable ofrece descarte y lo envía en descartes[]', async () => {
    // El reutilizable no exige reporte de consumo: vuelve al stock solo.
    mockGets({
      pedido: pedidoReutilizable,
      reserva: {
        ...reservaSinConsumo,
        materialesReservados: [
          {
            itemId: 'item-2',
            nombre: 'Matraz Erlenmeyer',
            cantidadTotal: 5,
            esConsumible: false,
            consumoEjecutado: false,
            liquidado: true,
            requiereConsumo: false,
            cantidadPendiente: 5,
          },
        ],
      },
    });
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /Finalizar Pedido/i }));

    // El reutilizable muestra descarte y no muestra consumo.
    const checkDescarte = await screen.findByLabelText(/Registrar descarte/i);
    expect(screen.queryByLabelText(/Cantidad consumida/i)).toBeNull();

    fireEvent.click(checkDescarte);
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Finalización/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Sí, finalizar/i }));

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

describe('PedidoDetalle — historial de actividad', () => {
  const usuario = { nombre: 'Ana', apellido: 'Pérez', rol: 'PERSONAL' };

  const pedidoConHistorial = {
    ...pedidoAceptado,
    historial: [
      {
        _id: 'h-1',
        accion: 'CREACION',
        descripcion: 'Pedido creado',
        createdAt: '2026-05-01T10:00:00.000Z',
        usuario,
        cambios: {},
      },
      {
        _id: 'h-2',
        accion: 'MODIFICACION',
        descripcion: 'Se modificó el pedido',
        createdAt: '2026-05-02T10:00:00.000Z',
        usuario,
        cambios: {
          // Campo simple: dispara CambioCampoSimple.
          alumnos: { antes: 10, despues: 20 },
          materia: { antes: 'Química', despues: 'Química Orgánica' },
          // Dispara CambioHorario.
          horario: {
            antes: { inicio: '2026-05-10T10:00:00.000Z', fin: '2026-05-10T12:00:00.000Z' },
            despues: { inicio: '2026-05-10T14:00:00.000Z', fin: '2026-05-10T16:00:00.000Z' },
          },
          // Dispara CambioRecursos.
          recursos: {
            antes: [{ recursoId: { _id: 'item-1', nombre: 'Alcohol etílico' }, tipoRecurso: 'Item', cantidad: 5 }],
            despues: [{ recursoId: { _id: 'item-1', nombre: 'Alcohol etílico' }, tipoRecurso: 'Item', cantidad: 8 }],
          },
        },
      },
      {
        _id: 'h-3',
        accion: 'CAMBIO_ESTADO',
        descripcion: 'Cambió el estado',
        createdAt: '2026-05-03T10:00:00.000Z',
        usuario,
        cambios: { estado: { antes: 'Pendiente', despues: 'Aceptado' } },
      },
      {
        _id: 'h-4',
        accion: 'APROBACION',
        descripcion: 'Pedido aprobado',
        createdAt: '2026-05-04T10:00:00.000Z',
        usuario,
      },
      {
        _id: 'h-5',
        accion: 'RECHAZO',
        descripcion: 'Pedido rechazado',
        createdAt: '2026-05-05T10:00:00.000Z',
        usuario,
      },
      {
        _id: 'h-6',
        accion: 'FINALIZACION',
        descripcion: 'Pedido finalizado',
        createdAt: '2026-05-06T10:00:00.000Z',
        usuario,
        // Sin antes/despues: cae en ResumenValorHistorial (utils/historialFormat).
        cambios: {
          reporteFinal: {
            descartes: [{ tipo: 'material', itemId: 'item-2', cantidad: 2, motivo: 'roto' }],
            desperfectos: [{ equipoId: 'eq-1', motivo: 'no enciende' }],
          },
        },
      },
      {
        _id: 'h-7',
        accion: 'COMENTARIO',
        descripcion: 'Nuevo comentario',
        createdAt: '2026-05-07T10:00:00.000Z',
        usuario,
      },
      {
        _id: 'h-8',
        accion: 'ELIMINACION',
        descripcion: 'Recurso eliminado',
        createdAt: '2026-05-08T10:00:00.000Z',
        usuario,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: pedidoConHistorial });
    api.patch.mockResolvedValue({ data: { pedido: pedidoConHistorial } });
  });

  const renderDetalle = async () => {
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );
    await screen.findByText('Historial de actividad');
  };

  test('lista todos los eventos del historial con su descripción', async () => {
    await renderDetalle();

    expect(screen.getByText('Pedido creado')).toBeInTheDocument();
    expect(screen.getByText('Se modificó el pedido')).toBeInTheDocument();
    expect(screen.getByText('Pedido aprobado')).toBeInTheDocument();
    expect(screen.getByText('Pedido rechazado')).toBeInTheDocument();
    expect(screen.getByText('Pedido finalizado')).toBeInTheDocument();
    expect(screen.getByText('Nuevo comentario')).toBeInTheDocument();
    expect(screen.getByText('Recurso eliminado')).toBeInTheDocument();
  });

  test('muestra el diff de un campo simple', async () => {
    await renderDetalle();

    // ETIQUETAS_CAMPO traduce la clave del cambio.
    expect(screen.getByText('Alumnos:')).toBeInTheDocument();
    expect(screen.getByText('Materia:')).toBeInTheDocument();
    // El valor viejo se tacha y el nuevo queda plano ("Química" también es la
    // materia del pedido en el encabezado, de ahí el filtro por line-through).
    const tachados = screen.getAllByText('Química').filter((n) => /line-through/.test(n.className));
    expect(tachados.length).toBe(1);
    expect(screen.getByText('Química Orgánica')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  test('muestra el cambio de horario como rango legible', async () => {
    await renderDetalle();

    expect(screen.getByText('Horario:')).toBeInTheDocument();
    // fmtRango arma "fecha de HH:MM a HH:MM"; el locale del runner define el formato exacto.
    expect(screen.getAllByText(/\d{1,2}:\d{2}/).length).toBeGreaterThan(0);
  });

  test('muestra el cambio de recursos con nombre y cantidad', async () => {
    await renderDetalle();

    expect(screen.getByText('Materiales/equipos:')).toBeInTheDocument();
    expect(screen.getAllByText(/Alcohol etílico/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/×5/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/×8/).length).toBeGreaterThan(0);
  });

  test('resume el reporte final de descartes y desperfectos', async () => {
    await renderDetalle();

    expect(screen.getByText('Reporte final:')).toBeInTheDocument();
    expect(screen.getByText(/Descartes/)).toBeInTheDocument();
    expect(screen.getByText(/Desperfectos/)).toBeInTheDocument();
    expect(screen.getByText(/no enciende/)).toBeInTheDocument();
  });

  test('el botón de historial colapsa y vuelve a expandir la lista', async () => {
    await renderDetalle();

    fireEvent.click(screen.getByText('Historial de actividad'));
    expect(screen.queryByText('Pedido creado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Historial de actividad'));
    expect(screen.getByText('Pedido creado')).toBeInTheDocument();
  });

  test('muestra el vacío cuando el pedido no tiene historial', async () => {
    api.get.mockResolvedValue({ data: { ...pedidoAceptado, historial: [] } });

    await renderDetalle();

    expect(screen.getByText('No hay actividad registrada.')).toBeInTheDocument();
  });
});

describe('PedidoDetalle — aprobar, rechazar y cancelar', () => {
  const pedidoPendiente = { ...pedidoAceptado, estado: 'Pendiente' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockResolvedValue({ data: pedidoPendiente });
    api.patch.mockResolvedValue({ data: { pedido: { ...pedidoPendiente, estado: 'Aceptado' } } });
  });

  const renderDetalle = async (data = pedidoPendiente) => {
    api.get.mockResolvedValue({ data });
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
  };

  test('muestra el estado de carga', () => {
    api.get.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('avisa si el pedido no existe', async () => {
    await renderDetalle(null);

    expect(screen.getByText('Pedido no encontrado')).toBeInTheDocument();
  });

  // Al montar, el componente ya hace un PATCH para marcar los comentarios como
  // vistos, así que los asserts miran el endpoint puntual y no api.patch entero.
  const seLlamo = (url) => api.patch.mock.calls.some(([u]) => u === url);

  test('aprobar pide confirmación antes de mandar', async () => {
    await renderDetalle();

    fireEvent.click(screen.getByRole('button', { name: /Aprobar/i }));

    expect(await screen.findByText('¿Aprobar pedido?')).toBeInTheDocument();
    expect(seLlamo('/pedido/pedido-1/aprobar')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: /Sí, aprobar/i }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/pedido/pedido-1/aprobar'));
  });

  test('muestra el error si no se puede aprobar', async () => {
    api.patch.mockRejectedValue({ response: { data: { error: 'El laboratorio está ocupado' } } });

    await renderDetalle();

    fireEvent.click(screen.getByRole('button', { name: /Aprobar/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Sí, aprobar/i }));

    expect(await screen.findByText('El laboratorio está ocupado')).toBeInTheDocument();
  });

  test('rechazar exige un motivo', async () => {
    await renderDetalle();

    fireEvent.click(screen.getByRole('button', { name: /Rechazar/i }));
    // El form inline aparece; sin motivo no se manda nada.
    fireEvent.click(await screen.findByRole('button', { name: /Confirmar Rechazo/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Sí, rechazar/i }));

    expect(await screen.findByText('Debe proporcionar un motivo de rechazo.')).toBeInTheDocument();
    expect(seLlamo('/pedido/pedido-1/estado')).toBe(false);
  });

  test('rechazar manda el motivo junto al estado', async () => {
    api.patch.mockResolvedValue({ data: { ...pedidoPendiente, estado: 'Rechazado' } });

    await renderDetalle();

    fireEvent.click(screen.getByRole('button', { name: /Rechazar/i }));
    fireEvent.change(await screen.findByPlaceholderText('Escribí el motivo...'), {
      target: { value: 'No hay stock' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Rechazo/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Sí, rechazar/i }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/pedido/pedido-1/estado', {
      estado: 'Rechazado',
      motivoRechazo: 'No hay stock',
    }));
  });

  test('cancelar el rechazo cierra el formulario', async () => {
    await renderDetalle();

    fireEvent.click(screen.getByRole('button', { name: /Rechazar/i }));
    expect(await screen.findByPlaceholderText('Escribí el motivo...')).toBeInTheDocument();

    // El "Cancelar" del form inline, no el de cancelar el pedido.
    fireEvent.click(screen.getAllByRole('button', { name: 'Cancelar' })[0]);

    expect(screen.queryByPlaceholderText('Escribí el motivo...')).not.toBeInTheDocument();
  });

  test('cancelar el pedido pide confirmación', async () => {
    api.patch.mockResolvedValue({ data: { ...pedidoPendiente, estado: 'Cancelado' } });

    await renderDetalle();

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(await screen.findByText('¿Cancelar pedido?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Sí, cancelar/i }));

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/pedido/pedido-1/estado', {
      estado: 'Cancelado',
    }));
  });

  test('muestra el error si no se puede cancelar', async () => {
    api.patch.mockRejectedValue(new Error('Network Error'));

    await renderDetalle();

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Sí, cancelar/i }));

    expect(await screen.findByText('Error al cancelar el pedido.')).toBeInTheDocument();
  });

  test('un pedido rechazado no ofrece acciones', async () => {
    await renderDetalle({ ...pedidoAceptado, estado: 'Rechazado', motivoRechazo: 'Sin stock' });

    expect(screen.queryByRole('button', { name: /Aprobar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Cancelar$/i })).not.toBeInTheDocument();
  });
});

describe('PedidoDetalle — comentarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockResolvedValue({ data: pedidoAceptado });
    api.post.mockResolvedValue({ data: { pedido: pedidoAceptado } });
    api.patch.mockResolvedValue({ data: { pedido: pedidoAceptado } });
  });

  const renderDetalle = async () => {
    render(
      <MemoryRouter>
        <PedidoDetalle />
      </MemoryRouter>
    );
    await screen.findByPlaceholderText('Escribí un comentario...');
  };

  test('envía un comentario', async () => {
    await renderDetalle();

    fireEvent.change(screen.getByPlaceholderText('Escribí un comentario...'), {
      target: { value: 'Falta material' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Comentar' }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/pedido/pedido-1/comentarios', {
      mensaje: 'Falta material',
    }));
  });

  test('no envía un comentario vacío', async () => {
    await renderDetalle();

    fireEvent.click(screen.getByRole('button', { name: 'Comentar' }));

    expect(api.post).not.toHaveBeenCalled();
  });

  test('muestra el error si falla el comentario', async () => {
    api.post.mockRejectedValue(new Error('Network Error'));

    await renderDetalle();

    fireEvent.change(screen.getByPlaceholderText('Escribí un comentario...'), {
      target: { value: 'Hola' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Comentar' }));

    expect(await screen.findByText('No se pudo agregar el comentario.')).toBeInTheDocument();
  });
});
