import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import FormularioEquipamiento from '../../components/equipamiento/FormularioEquipamiento';

describe('FormularioEquipamiento Component', () => {
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn((e) => e.preventDefault());
  const mockCerrarModal = vi.fn();

  const defaultFormData = {
    nombre: 'Pipeta',
    cantidad: 10,
    unidad: 'unidad',
    ubicacion: 'Lab Central',
    movilidad: 'Fija',
    estado: 'Disponible'
  };

  test('renderiza correctamente los valores iniciales de formData', () => {
    render(
      <FormularioEquipamiento 
        formData={defaultFormData} 
        handleChange={mockHandleChange} 
        handleSubmit={mockHandleSubmit} 
        cerrarModal={mockCerrarModal} 
      />
    );

    expect(screen.getByDisplayValue('Pipeta')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('unidad')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lab Central')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fija')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Disponible')).toBeInTheDocument();
  });

  test('llama a handleChange cuando el usuario escribe', () => {
    render(
      <FormularioEquipamiento 
        formData={defaultFormData} 
        handleChange={mockHandleChange} 
        handleSubmit={mockHandleSubmit} 
        cerrarModal={mockCerrarModal} 
      />
    );

    const inputNombre = screen.getByDisplayValue('Pipeta');
    fireEvent.change(inputNombre, { target: { name: 'nombre', value: 'Pipeta Graduada' } });

    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  });

  test('llama a handleSubmit al enviar y a cerrarModal al cancelar', () => {
    render(
      <FormularioEquipamiento 
        formData={defaultFormData} handleChange={mockHandleChange} 
        handleSubmit={mockHandleSubmit} cerrarModal={mockCerrarModal} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(mockCerrarModal).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});