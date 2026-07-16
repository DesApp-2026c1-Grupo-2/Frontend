import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import Historial from '../../pages/historial';

// Los paneles se testean por separado; acá solo importa qué tab se muestra.
vi.mock('../../components/historial/PanelMovimientos', () => ({
  default: () => <div data-testid="panel-movimientos" />,
}));
vi.mock('../../components/historial/PanelDescartes', () => ({
  default: () => <div data-testid="panel-descartes" />,
}));
vi.mock('../../components/historial/PanelMantenimiento', () => ({
  default: () => <div data-testid="panel-mantenimiento" />,
}));
vi.mock('../../components/SharedUi', () => ({
  PageHeader: ({ title }) => <h1>{title}</h1>,
}));

const renderHistorial = (ruta = '/historial') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Historial />
    </MemoryRouter>
  );

describe('Historial Page', () => {
  test('sin tab en la URL muestra movimientos', () => {
    renderHistorial();

    expect(screen.getByText('Historial')).toBeInTheDocument();
    expect(screen.getByTestId('panel-movimientos')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-descartes')).not.toBeInTheDocument();
  });

  test('respeta el tab que viene en la URL', () => {
    renderHistorial('/historial?tab=descartes');

    expect(screen.getByTestId('panel-descartes')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-movimientos')).not.toBeInTheDocument();
  });

  test('muestra el panel de mantenimiento desde la URL', () => {
    renderHistorial('/historial?tab=mantenimiento');

    expect(screen.getByTestId('panel-mantenimiento')).toBeInTheDocument();
  });

  test('un tab inválido cae a movimientos', () => {
    renderHistorial('/historial?tab=inventado');

    expect(screen.getByTestId('panel-movimientos')).toBeInTheDocument();
  });

  test('cambiar de tab cambia el panel', () => {
    renderHistorial();

    fireEvent.click(screen.getByRole('button', { name: /Mantenimiento/ }));
    expect(screen.getByTestId('panel-mantenimiento')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Descartes/ }));
    expect(screen.getByTestId('panel-descartes')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-mantenimiento')).not.toBeInTheDocument();
  });
});
