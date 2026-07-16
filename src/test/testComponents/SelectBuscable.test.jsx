import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import SelectBuscable from '../../components/common/SelectBuscable';

// Ojo: no se mockea react-icons. El botón de limpiar es un <svg> que recibe
// role y aria-label como props, y un mock que no las reenvíe rompe el test.

const options = [
  { value: 'eq-1', label: 'Microscopio · EQ-001' },
  { value: 'eq-2', label: 'Centrífuga · EQ-002' },
  { value: 'eq-3', label: 'Balanza · EQ-003' },
];

describe('SelectBuscable Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSelect = (props = {}) =>
    render(<SelectBuscable value="" onChange={mockOnChange} options={options} {...props} />);

  // El trigger es el primer button; la lista solo existe con open === true.
  const abrir = () => fireEvent.click(screen.getAllByRole('button')[0]);

  test('muestra el placeholder por defecto cuando no hay selección', () => {
    renderSelect();

    expect(screen.getByText('Seleccioná una opción…')).toBeInTheDocument();
  });

  test('acepta un placeholder personalizado', () => {
    renderSelect({ placeholder: 'Seleccioná un equipo…' });

    expect(screen.getByText('Seleccioná un equipo…')).toBeInTheDocument();
  });

  test('muestra la etiqueta de la opción seleccionada', () => {
    renderSelect({ value: 'eq-2' });

    expect(screen.getByText('Centrífuga · EQ-002')).toBeInTheDocument();
    expect(screen.queryByText('Seleccioná una opción…')).not.toBeInTheDocument();
  });

  test('compara el valor de forma estricta, sin coercionar el tipo', () => {
    render(
      <SelectBuscable value={1} onChange={mockOnChange} options={[{ value: '1', label: 'Uno' }]} />
    );

    // 1 !== '1', así que no hay selección: se ve el placeholder.
    expect(screen.getByText('Seleccioná una opción…')).toBeInTheDocument();
  });

  test('la lista está cerrada hasta que se hace click', () => {
    renderSelect();

    expect(screen.queryByPlaceholderText('Buscar…')).not.toBeInTheDocument();

    abrir();

    expect(screen.getByPlaceholderText('Buscar…')).toBeInTheDocument();
    expect(screen.getByText('Microscopio · EQ-001')).toBeInTheDocument();
  });

  test('un segundo click cierra la lista', () => {
    renderSelect();

    abrir();
    abrir();

    expect(screen.queryByPlaceholderText('Buscar…')).not.toBeInTheDocument();
  });

  test('acepta un placeholder de búsqueda personalizado', () => {
    renderSelect({ buscarPlaceholder: 'Buscar por nombre o código…' });

    abrir();

    expect(screen.getByPlaceholderText('Buscar por nombre o código…')).toBeInTheDocument();
  });

  test('elegir una opción devuelve el valor crudo y cierra', () => {
    renderSelect();

    abrir();
    fireEvent.click(screen.getByRole('button', { name: 'Balanza · EQ-003' }));

    // A diferencia de CustomSelect, no emite un evento sintético.
    expect(mockOnChange).toHaveBeenCalledWith('eq-3');
    expect(screen.queryByPlaceholderText('Buscar…')).not.toBeInTheDocument();
  });

  test('filtra las opciones por texto, sin distinguir mayúsculas', () => {
    renderSelect();

    abrir();
    fireEvent.change(screen.getByPlaceholderText('Buscar…'), { target: { value: 'centrí' } });

    expect(screen.getByRole('button', { name: 'Centrífuga · EQ-002' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Microscopio · EQ-001' })).not.toBeInTheDocument();
  });

  test('avisa cuando la búsqueda no encuentra nada', () => {
    renderSelect();

    abrir();
    fireEvent.change(screen.getByPlaceholderText('Buscar…'), { target: { value: 'zzz' } });

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  // Ojo: el toggle del trigger solo hace setOpen(!open), no pasa por cerrar(),
  // así que la búsqueda escrita sobrevive. Solo la limpian Escape, el click
  // afuera y elegir una opción.
  test('cerrar con Escape limpia la búsqueda', () => {
    renderSelect();

    abrir();
    fireEvent.change(screen.getByPlaceholderText('Buscar…'), { target: { value: 'zzz' } });
    fireEvent.keyDown(document, { key: 'Escape' });
    abrir();

    expect(screen.getByPlaceholderText('Buscar…')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Microscopio · EQ-001' })).toBeInTheDocument();
  });

  test('cerrar con el trigger conserva lo buscado', () => {
    renderSelect();

    abrir();
    fireEvent.change(screen.getByPlaceholderText('Buscar…'), { target: { value: 'zzz' } });
    fireEvent.click(screen.getAllByRole('button')[0]); // cierra sin pasar por cerrar()
    abrir();

    expect(screen.getByPlaceholderText('Buscar…')).toHaveValue('zzz');
  });

  test('el botón de limpiar aparece solo con selección y la borra', () => {
    const { rerender } = renderSelect();

    expect(screen.queryByLabelText('Limpiar selección')).not.toBeInTheDocument();

    rerender(<SelectBuscable value="eq-1" onChange={mockOnChange} options={options} />);

    fireEvent.click(screen.getByLabelText('Limpiar selección'));

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  test('un click afuera cierra la lista', () => {
    renderSelect();

    abrir();
    fireEvent.mouseDown(document.body);

    expect(screen.queryByPlaceholderText('Buscar…')).not.toBeInTheDocument();
  });

  test('un click adentro no la cierra', () => {
    renderSelect();

    abrir();
    fireEvent.mouseDown(screen.getByPlaceholderText('Buscar…'));

    expect(screen.getByPlaceholderText('Buscar…')).toBeInTheDocument();
  });

  test('Escape cierra la lista', () => {
    renderSelect();

    abrir();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByPlaceholderText('Buscar…')).not.toBeInTheDocument();
  });

  test('otras teclas no la cierran', () => {
    renderSelect();

    abrir();
    fireEvent.keyDown(document, { key: 'Enter' });

    expect(screen.getByPlaceholderText('Buscar…')).toBeInTheDocument();
  });

  test('sin opciones muestra el vacío', () => {
    render(<SelectBuscable value="" onChange={mockOnChange} />);

    abrir();

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });
});
