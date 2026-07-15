import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FormularioMaterial from '../../components/equipamiento/FormularioMaterial';
import FormularioReactivo from '../../components/equipamiento/FormularioReactivo';
import FormularioSustancia from '../../components/equipamiento/FormularioSustancia';
import FormularioLote from '../../components/equipamiento/FormularioLote';
import FormularioItem from '../../components/equipamiento/FormularioItem';
import FormularioAgregarLote from '../../components/equipamiento/FormularioAgregarLote';
import FormularioDesperfecto from '../../components/equipamiento/FormularioDesperfecto';

// Los 7 formularios de inventario no comparten un componente base, pero sí la
// forma de las props: { formData, handleChange, handleSubmit, errores }.
const casos = [
  {
    nombre: 'FormularioMaterial',
    Componente: FormularioMaterial,
    formData: { nombre: 'Vaso', cantidad: '5', unidad: 'unidad', estado: 'Disponible' },
    campoTexto: 'Vaso',
    conEstado: true,
  },
  {
    nombre: 'FormularioReactivo',
    Componente: FormularioReactivo,
    formData: { nombre: 'HCl', cantidad: '2', unidad: 'ml', estado: 'Disponible', fechaVencimiento: '' },
    campoTexto: 'HCl',
    conEstado: true,
  },
  {
    nombre: 'FormularioSustancia',
    Componente: FormularioSustancia,
    formData: { nombre: 'NaCl', cantidad: '3', unidad: 'g', estado: 'Disponible', fechaVencimiento: '' },
    campoTexto: 'NaCl',
    conEstado: true,
  },
  {
    nombre: 'FormularioLote',
    Componente: FormularioLote,
    formData: { cantidad: '10', estado: 'Disponible' },
    campoTexto: '10',
    conEstado: true,
  },
  {
    nombre: 'FormularioItem',
    Componente: FormularioItem,
    formData: { nombre: 'Ácido', codigo: 'RC-001', cantidad: '4', unidad: 'ml' },
    campoTexto: 'Ácido',
    conEstado: false,
  },
  {
    nombre: 'FormularioAgregarLote',
    Componente: FormularioAgregarLote,
    formData: { cantidad: '7', fechaVencimiento: '' },
    campoTexto: '7',
    conEstado: false,
  },
];

describe.each(casos)('$nombre', (caso) => {
  const { formData, campoTexto, conEstado } = caso;
  const handleChange = vi.fn();
  const handleSubmit = vi.fn((e) => e.preventDefault());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) =>
    render(
      <caso.Componente
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        {...props}
      />
    );

  test('renderiza los valores que recibe en formData', () => {
    renderForm();

    expect(screen.getByDisplayValue(campoTexto)).toBeInTheDocument();
  });

  test('avisa cada cambio de los inputs', () => {
    const { container } = renderForm();

    const input = container.querySelector('input[name]');
    fireEvent.change(input, { target: { value: 'nuevo valor' } });

    expect(handleChange).toHaveBeenCalled();
  });

  test('envía el formulario', () => {
    const { container } = renderForm();

    fireEvent.submit(container.querySelector('form'));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test('muestra los errores de validación que recibe', () => {
    renderForm({ errores: { cantidad: 'La cantidad es obligatoria' } });

    expect(screen.getByText('La cantidad es obligatoria')).toBeInTheDocument();
  });

  if (conEstado) {
    test('avisa que descartar da de baja el stock', () => {
      renderForm({ formData: { ...formData, estado: 'Descartado' } });

      expect(screen.getByText(/baja de stock/)).toBeInTheDocument();
    });
  }
});

describe('FormularioDesperfecto', () => {
  const handleChange = vi.fn();
  const handleSubmit = vi.fn((e) => e.preventDefault());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) =>
    render(
      <FormularioDesperfecto
        desperfectoItem={{ tipo: 'Microscopio', codigo: 'EQ-001' }}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        {...props}
      />
    );

  test('muestra el equipo afectado y el detalle escrito', () => {
    renderForm({ desperfectoForm: { descripcion: 'abcd' } });

    expect(screen.getByDisplayValue('abcd')).toBeInTheDocument();
    // Contador de caracteres.
    expect(screen.getByText('4/500')).toBeInTheDocument();
  });

  test('avisa los cambios y el envío', () => {
    const { container } = renderForm();

    fireEvent.change(screen.getByPlaceholderText('Escribir detalle del desperfecto...'), {
      target: { value: 'se rompió' },
    });
    expect(handleChange).toHaveBeenCalled();

    fireEvent.submit(container.querySelector('form'));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test('mientras envía deshabilita el botón', () => {
    renderForm({ enviando: true });

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
  });
});
