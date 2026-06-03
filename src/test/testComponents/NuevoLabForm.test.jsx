import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import NuevoLaboratorioForm from '../../components/laboratorios/NuevoLabForm';

describe('NuevoLaboratorioForm Component', () => {
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn((e) => e.preventDefault());
  const mockCerrarModal = vi.fn();

  const defaultProps = {
    formData: {
      nombre: '',
      capacidad: '',
      tipo: '',
    },
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
    cerrarModal: mockCerrarModal,
  };

  test('ejecuta handleChange al escribir en los inputs', () => {
    render(<NuevoLaboratorioForm {...defaultProps} />);
    
    const inputNombre = screen.getByPlaceholderText(/Ej: Laboratorio 202/i);
    fireEvent.change(inputNombre, { target: { name: 'nombre', value: 'Lab 101' } });
    
    const inputCapacidad = screen.getByPlaceholderText(/Ej: 30/i);
    fireEvent.change(inputCapacidad, { target: { name: 'capacidad', value: '40' } });

    expect(mockHandleChange).toHaveBeenCalledTimes(2);
  });

  test('ejecuta cerrarModal al hacer clic en Cancelar', () => {
    render(<NuevoLaboratorioForm {...defaultProps} />);
    
    const btnCancel = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(btnCancel);
    
    expect(mockCerrarModal).toHaveBeenCalledTimes(1);
  });

  test('ejecuta handleSubmit al enviar el formulario', () => {
    render(<NuevoLaboratorioForm {...defaultProps} />);
    
    const btnSubmit = screen.getByRole('button', { name: /Crear laboratorio/i });
    const form = btnSubmit.closest('form');
    fireEvent.submit(form);
    
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});