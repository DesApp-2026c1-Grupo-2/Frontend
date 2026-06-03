import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { ModuleCard } from '../../components/ModuleCard';

vi.mock('../../components/SharedUi', () => ({
  StatBadge: ({ text }) => <span data-testid="stat-badge">{text}</span>
}));

describe('ModuleCard Component', () => {
  test('renderiza correctamente el título, descripción, icono y estadisticas', () => {
    render(
      <ModuleCard 
        title="Card de Inventario" 
        description="Supervisa todos los reactivos" 
        stats="120 Registros activos" 
        icon={<svg data-testid="mock-icon" />} 
        delayIndex={2} 
      />
    );

    expect(screen.getByText('Card de Inventario')).toBeInTheDocument();
    expect(screen.getByText('Supervisa todos los reactivos')).toBeInTheDocument();
    expect(screen.getByTestId('stat-badge')).toHaveTextContent('120 Registros activos');
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  test('ejecuta onClick adecuadamente cuando se clickea la tarjeta', () => {
    const mockOnClick = vi.fn();
    const { container } = render(<ModuleCard title="Prueba" onClick={mockOnClick} />);
    
    fireEvent.click(container.firstChild);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});