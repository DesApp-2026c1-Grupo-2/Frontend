import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import CustomSelect from '../../components/common/CustomSelect';

const options = [
  { value: 'a', label: 'Opción A' },
  { value: 'b', label: 'Opción B' },
];

describe('CustomSelect Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSelect = (props = {}) =>
    render(<CustomSelect name="campo" value="" onChange={mockOnChange} options={options} {...props} />);

  const clickOpcion = (nombre) => {
    const opcion = screen.getByRole('option', { name: nombre });
    fireEvent.click(within(opcion).getByRole('button'));
  };

  test('muestra el placeholder por defecto cuando no hay valor', () => {
    renderSelect();

    expect(screen.getByText('Seleccionar...')).toBeInTheDocument();
  });

  test('muestra un placeholder personalizado', () => {
    renderSelect({ placeholder: 'Elegí algo' });

    expect(screen.getByText('Elegí algo')).toBeInTheDocument();
  });

  test('muestra la etiqueta de la opción seleccionada', () => {
    renderSelect({ value: 'b' });

    expect(screen.getByText('Opción B')).toBeInTheDocument();
    expect(screen.queryByText('Seleccionar...')).not.toBeInTheDocument();
  });

  test('matchea el valor aunque el tipo no coincida', () => {
    render(
      <CustomSelect name="n" value={1} onChange={mockOnChange} options={[{ value: '1', label: 'Uno' }]} />
    );

    expect(screen.getByText('Uno')).toBeInTheDocument();
  });

  test('el listado está cerrado hasta que se hace click', () => {
    renderSelect();

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  test('refleja el estado abierto en aria-expanded', () => {
    renderSelect();
    const trigger = screen.getByRole('button');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('un segundo click sobre el trigger vuelve a cerrar', () => {
    renderSelect();
    const trigger = screen.getByRole('button');

    fireEvent.click(trigger);
    fireEvent.click(trigger);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('elegir una opción avisa con la forma de un select nativo y cierra', () => {
    renderSelect();

    fireEvent.click(screen.getByRole('button'));
    clickOpcion('Opción A');

    expect(mockOnChange).toHaveBeenCalledWith({ target: { name: 'campo', value: 'a' } });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('marca la opción activa con aria-selected', () => {
    renderSelect({ value: 'a' });

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('option', { name: 'Opción A' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Opción B' })).toHaveAttribute('aria-selected', 'false');
  });

  test('deshabilitado no abre el listado', () => {
    renderSelect({ disabled: true });

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('un click afuera cierra el listado', () => {
    renderSelect();

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('un toque afuera cierra el listado', () => {
    renderSelect();

    fireEvent.click(screen.getByRole('button'));
    fireEvent.touchStart(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('un click adentro del componente no lo cierra', () => {
    renderSelect();

    fireEvent.click(screen.getByRole('button'));
    fireEvent.mouseDown(screen.getByRole('listbox'));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('Escape cierra el listado', () => {
    renderSelect();

    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('otras teclas no cierran el listado', () => {
    renderSelect();

    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(document, { key: 'Enter' });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
