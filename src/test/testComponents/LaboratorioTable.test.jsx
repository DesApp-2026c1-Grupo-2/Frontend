import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import LaboratorioTable from '../../components/laboratorios/LaboratorioTable';

describe('LaboratorioTable Component', () => {
  const mockOnEditar = vi.fn();

  const mockLaboratorios = [
    {
      id: 'lab-123456',
      nombre: 'Laboratorio de Informática',
      capacidad: 40,
      tipo: 'mixto',
      estado: 'disponible'
    },
    {
      id: 'lab-987654',
      nombre: 'Laboratorio de Química',
      capacidad: 20,
      tipo: 'quimica',
      estado: 'mantenimiento'
    }
  ];

  const mockEquipos = [
    {
      id: 'eq-1',
      nombre: 'PC Escritorio',
      tipo: 'Computadora',
      estado: 'disponible',
      laboratorioId: { id: 'lab-123456' }
    }
  ];

  test('renderiza correctamente la lista de laboratorios', () => {
    render(<LaboratorioTable laboratorios={mockLaboratorios} equipos={mockEquipos} onEditar={mockOnEditar} />);

    expect(screen.getByText('Laboratorio de Informática')).toBeInTheDocument();
    expect(screen.getByText('Laboratorio de Química')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument(); // id slice(-6)
    expect(screen.getByText('mantenimiento')).toBeInTheDocument();
  });

  test('expande la fila para ver los equipos cuando el laboratorio tiene equipos', () => {
    render(<LaboratorioTable laboratorios={mockLaboratorios} equipos={mockEquipos} onEditar={mockOnEditar} />);
    
    const btnVerEquipos = screen.getByRole('button', { name: /Ver equipos \(1\)/i });
    fireEvent.click(btnVerEquipos);

    // Comprobar que el equipo asociado se muestra al expandir
    expect(screen.getByText('PC Escritorio')).toBeInTheDocument();
  });

  test('ejecuta onEditar al hacer clic en el botón Editar', () => {
    render(<LaboratorioTable laboratorios={mockLaboratorios} equipos={mockEquipos} onEditar={mockOnEditar} />);
    
    const btnEditarList = screen.getAllByRole('button', { name: /Editar/i });
    // Hacemos clic en el primer botón de editar
    fireEvent.click(btnEditarList[0]);

    expect(mockOnEditar).toHaveBeenCalledWith(mockLaboratorios[0]);
  });
});