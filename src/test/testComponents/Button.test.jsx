import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Button } from '../../components/Button';

describe('Button Component', () => {
  test('renderiza correctamente el contenido hijo', () => {
    render(<Button>Guardar datos</Button>);
    expect(screen.getByText('Guardar datos')).toBeInTheDocument();
  });

  test('llama a la función onClick cuando el usuario hace clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Hacer clic</Button>);
    
    const buttonElement = screen.getByText('Hacer clic');
    fireEvent.click(buttonElement);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('aplica los atributos HTML nativos como "type" o "disabled"', () => {
    render(
      <Button type="submit" disabled>
        Enviar
      </Button>
    );
    
    const buttonElement = screen.getByText('Enviar');
    expect(buttonElement).toHaveAttribute('type', 'submit');
    expect(buttonElement).toBeDisabled();
  });
});