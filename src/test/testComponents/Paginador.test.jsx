import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Paginador from '../../components/common/Paginador';

describe('Paginador', () => {
  test('no renderiza nada cuando hay una sola página', () => {
    const { container } = render(
      <Paginador page={1} totalPaginas={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('deshabilita "Anterior" en la primera página y "Siguiente" en la última', () => {
    const { rerender } = render(
      <Paginador page={1} totalPaginas={3} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /Anterior/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Siguiente/i })).not.toBeDisabled();

    rerender(<Paginador page={3} totalPaginas={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Siguiente/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Anterior/i })).not.toBeDisabled();
  });

  test('onPageChange recibe la página destino correcta', () => {
    const onPageChange = vi.fn();
    render(<Paginador page={2} totalPaginas={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: /Anterior/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  test('muestra "Página X de Y"', () => {
    render(<Paginador page={2} totalPaginas={4} onPageChange={vi.fn()} />);
    expect(screen.getByText('Página 2 de 4')).toBeInTheDocument();
  });
});
