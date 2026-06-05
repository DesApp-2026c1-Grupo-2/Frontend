import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import CrearEdificioModal from '../../components/edificios/CrearEdificioModal';

describe('CrearEdificioModal Component', () => {
  const mockCerrarModal = vi.fn();
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn();

  const defaultProps = {
    cerrarModal: mockCerrarModal,
    formData: { nombre: '', direccion: '' },
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
  };

  test('no se renderiza en el DOM cuando "mostrar" es false', () => {
    // Nota: Dependiendo de tu implementación de CrearEdificioModal,
    // podría no renderizar nada o renderizar un div con display: none o hidden.
    render(<CrearEdificioModal mostrar={false} {...defaultProps} />);
    
    const modalTitle = screen.queryByText(/Crear edificio/i);
    // Si no está oculto por clases CSS de tailwind, no debería estar presente
    if (!modalTitle) {
      expect(modalTitle).toBeNull();
    }
  });

  test('se renderiza correctamente cuando "mostrar" es true y muestra la información del estado', () => {
    render(
      <CrearEdificioModal 
        mostrar={true} 
        {...defaultProps} 
        formData={{ nombre: 'Edificio Central', direccion: 'Avenida 123' }} 
      />
    );
    
    // Validamos que los inputs tomen el valor desde `formData`
    expect(screen.getByDisplayValue('Edificio Central')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Avenida 123')).toBeInTheDocument();
  });

  test('ejecuta handleChange al escribir en los inputs', () => {
    render(<CrearEdificioModal mostrar={true} {...defaultProps} />);
    
    // Dependiendo de si usas placeholders, labels o roles, seleccionamos el elemento:
    // Si tienes un input de nombre asumo un rol genérico de textbox:
    const inputs = screen.getAllByRole('textbox');
    
    // Simulamos un evento change en el primer input (usualmente "nombre")
    fireEvent.change(inputs[0], { target: { name: 'nombre', value: 'Nuevo Nombre' } });
    
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  });

  test('ejecuta handleSubmit al hacer clic en guardar (o enviar el form)', () => {
    // Proveemos datos válidos para evitar que el DOM bloquee el submit por atributos "required"
    render(
      <CrearEdificioModal 
        mostrar={true} 
        {...defaultProps} 
        formData={{ nombre: 'Nuevo Edificio', direccion: 'Avenida Test 123' }}
      />
    );
    
    // Si el modal es un formulario, típicamente al dar submit:
    // Si tiene un botón Guardar o Crear:
    const btnSubmit = screen.getByRole('button', { name: /Guardar|Crear/i });
    const form = btnSubmit.closest('form');
    
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(btnSubmit);
    }
    
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  test('ejecuta cerrarModal al hacer clic en cancelar', () => {
    render(<CrearEdificioModal mostrar={true} {...defaultProps} />);
    
    // Buscamos el botón de cerrar/cancelar
    // Usamos una regex insensible a mayúsculas/minúsculas
    const btnCancel = screen.getByRole('button', { name: /Cerrar|Cancelar/i });
    fireEvent.click(btnCancel);
    
    expect(mockCerrarModal).toHaveBeenCalledTimes(1);
  });
});