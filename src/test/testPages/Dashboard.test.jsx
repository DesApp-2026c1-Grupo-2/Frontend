import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../../pages/Dashboard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de los datos para tener control predecible de los elementos
vi.mock('../../data/edificios', () => ({
  edificios: [
    { nombre: "Edificio Test 1", total: 5, disponibles: 2, position: "top-[10%] left-[15%]", ruta: "/laboratorios/t1" },
    { nombre: "Edificio Test 2", total: 3, disponibles: 0, position: "bottom-[10%] right-[15%]", ruta: "/laboratorios/t2" }
  ]
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza correctamente los edificios usando la data', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Edificio Test 1')).toBeInTheDocument();
    expect(screen.getByText('Total: 5')).toBeInTheDocument();
    expect(screen.getByText('Disponibles: 2')).toBeInTheDocument();

    expect(screen.getByText('Edificio Test 2')).toBeInTheDocument();
    expect(screen.getByText('Total: 3')).toBeInTheDocument();
    expect(screen.getByText('Disponibles: 0')).toBeInTheDocument();
  });

  test('navega a la ruta indicada si se hace click en un edificio disponible', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Edificio Test 1'));
    expect(mockNavigate).toHaveBeenCalledWith('/laboratorios/t1');
  });

  test('no navega al hacer click si el edificio no tiene laboratorios disponibles', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Edificio Test 2'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});