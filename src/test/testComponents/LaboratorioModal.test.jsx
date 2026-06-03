import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import LaboratorioModal from '../../components/laboratorios/LaboratorioModal';

describe('LaboratorioModal Component', () => {
  const defaultProps = {
    mostrar: true,
    cerrarModal: vi.fn(),
    formData: { nombre: '', capacidad: '', tipo: '', estado: '' },
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
    esEdicion: false,
  };

  test('no renderiza nada cuando mostrar es false', () => {
    const { container } = render(<LaboratorioModal {...defaultProps} mostrar={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renderiza NuevoLaboratorioForm cuando esEdicion es false', () => {
    render(<LaboratorioModal {...defaultProps} esEdicion={false} />);
    
    // Título del modal
    expect(screen.getByText('Nuevo laboratorio')).toBeInTheDocument();
    
    // Texto específico del componente NuevoLabForm
    expect(screen.getByText(/El laboratorio será creado automáticamente con estado/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear laboratorio/i })).toBeInTheDocument();
  });

  test('renderiza FormularioLaboratorio cuando esEdicion es true', () => {
    render(<LaboratorioModal {...defaultProps} esEdicion={true} />);
    
    // Título del modal
    expect(screen.getByText('Editar laboratorio')).toBeInTheDocument();
    
    // El componente de edición tiene un botón específico
    expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
  });
});