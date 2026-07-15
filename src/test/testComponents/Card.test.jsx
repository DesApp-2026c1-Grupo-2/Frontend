import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Card } from '../../components/equipamiento/Card';

describe('Card Component', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza su contenido', () => {
    render(<Card>Contenido de prueba</Card>);

    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });

  test('sin onClick no es interactiva', () => {
    render(<Card>Solo lectura</Card>);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Solo lectura')).not.toHaveAttribute('tabIndex');
  });

  test('con onClick se comporta como botón accesible', () => {
    render(<Card onClick={mockOnClick}>Clickeable</Card>);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');

    fireEvent.click(card);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('se activa con Enter y con Espacio', () => {
    render(<Card onClick={mockOnClick}>Clickeable</Card>);
    const card = screen.getByRole('button');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  test('otras teclas no la activan', () => {
    render(<Card onClick={mockOnClick}>Clickeable</Card>);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'a' });

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('aplica las clases de la variante elegida', () => {
    const { rerender } = render(<Card variant="soft">X</Card>);
    expect(screen.getByText('X').className).toMatch(/bg-slate-50/);

    rerender(<Card variant="gradient">X</Card>);
    expect(screen.getByText('X').className).toMatch(/bg-gradient-to-br/);

    rerender(<Card variant="default">X</Card>);
    expect(screen.getByText('X').className).toMatch(/bg-white/);
  });

  test('aplica el padding elegido', () => {
    const { rerender } = render(<Card padding="none">X</Card>);
    expect(screen.getByText('X').className).not.toMatch(/\bp-\d/);

    rerender(<Card padding="lg">X</Card>);
    expect(screen.getByText('X').className).toMatch(/p-6/);
  });

  test('hover agrega la transición y el id y className se propagan', () => {
    render(<Card hover id="mi-card" className="extra">X</Card>);

    const card = screen.getByText('X');
    expect(card).toHaveAttribute('id', 'mi-card');
    expect(card.className).toMatch(/extra/);
    expect(card.className).toMatch(/hover:-translate-y-0.5/);
  });
});
