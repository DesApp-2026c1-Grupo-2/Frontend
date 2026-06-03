import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { Card } from '../../components/Card';

describe('Card Component', () => {
  test('renderiza correctamente el contenido interior (children)', () => {
    render(
      <Card>
        <p>Contenido de prueba</p>
      </Card>
    );
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });

  test('combina las clases CSS adicionales pasadas por prop', () => {
    const { container } = render(
      <Card className="clase-personalizada">
        Texto interno
      </Card>
    );
    expect(container.firstChild).toHaveClass('clase-personalizada');
  });
});