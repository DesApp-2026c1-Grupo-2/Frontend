import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { PageHeader } from '../../components/SharedUi';

describe('SharedUi - PageHeader Component', () => {
  test('renderiza el título y la descripción correctamente', () => {
    render(
      <PageHeader 
        title="Equipamiento" 
        description="Descripción de prueba" 
      />
    );

    expect(screen.getByText('Equipamiento')).toBeInTheDocument();
    expect(screen.getByText('Descripción de prueba')).toBeInTheDocument();
  });

  test('renderiza el pre-título si se le proporciona por prop', () => {
    render(
      <PageHeader 
        preTitle="Gestión"
        title="Edificios" 
        description="Visualización dinámica" 
      />
    );

    // Usamos métodos asertivos estándar para confirmar que están en el documento
    expect(screen.getByText('Gestión')).toBeInTheDocument();
    expect(screen.getByText('Edificios')).toBeInTheDocument();
    expect(screen.getByText('Visualización dinámica')).toBeInTheDocument();
  });
});