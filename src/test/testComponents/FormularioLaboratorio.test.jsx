import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import FormularioLaboratorio from '../../components/laboratorios/FormularioLaboratorio';

describe('FormularioLaboratorio Component', () => {
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn((e) => e.preventDefault());
  const mockCerrarModal = vi.fn();

  const defaultProps = {
    formData: {
      nombre: 'Lab de Física',
      capacidad: '25',
      tipo: 'mixto',
      estado: 'disponible',
    },
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
    cerrarModal: mockCerrarModal,
  };

  test('renderiza correctamente y muestra los campos de solo lectura', () => {
    render(<FormularioLaboratorio {...defaultProps} />);
    
    const inputNombre = screen.getByDisplayValue('Lab de Física');
    const inputCapacidad = screen.getByDisplayValue('25');
    const inputTipo = screen.getByDisplayValue('mixto');

    expect(inputNombre).toBeInTheDocument();
    expect(inputNombre).toBeDisabled();
    expect(inputCapacidad).toBeDisabled();
    expect(inputTipo).toBeDisabled();
  });

  test('ejecuta handleChange al cambiar el estado', () => {
    render(<FormularioLaboratorio {...defaultProps} />);
    
    const selectEstado = screen.getByDisplayValue('Disponible');
    fireEvent.change(selectEstado, { target: { name: 'estado', value: 'reservado' } });
    
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
  });

  test('ejecuta cerrarModal al hacer clic en Cancelar', () => {
    render(<FormularioLaboratorio {...defaultProps} />);
    
    const btnCancel = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(btnCancel);
    
    expect(mockCerrarModal).toHaveBeenCalledTimes(1);
  });

  test('ejecuta handleSubmit al enviar el formulario', () => {
    render(<FormularioLaboratorio {...defaultProps} />);
    
    const btnSubmit = screen.getByRole('button', { name: /Guardar cambios/i });
    const form = btnSubmit.closest('form');
    fireEvent.submit(form);
    
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});