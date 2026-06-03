import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Componente de prueba para consumir el contexto fácilmente en el DOM
const TestComponent = () => {
  const { user, token, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.nombre : 'no-user'}</span>
      <span data-testid="token">{token || 'no-token'}</span>
      <button onClick={() => login({ nombre: 'Juan' }, 'fake-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext y useAuth Hook', () => {
  beforeEach(() => {
    // Limpiamos el localStorage y los mocks antes de cada test para no contaminar el estado
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('useAuth lanza un error si se utiliza fuera del AuthProvider', () => {
    // Silenciamos console.error momentáneamente porque React se quejará del error lanzado
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useAuth())).toThrow('useAuth debe ser usado dentro de un AuthProvider');
    
    consoleSpy.mockRestore();
  });

  test('inicializa con valores nulos si localStorage está vacío', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(screen.getByTestId('token').textContent).toBe('no-token');
  });

  test('inicializa con datos si localStorage contiene un JSON válido', () => {
    localStorage.setItem('user', JSON.stringify({ nombre: 'Maria' }));
    localStorage.setItem('token', 'saved-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user').textContent).toBe('Maria');
    expect(screen.getByTestId('token').textContent).toBe('saved-token');
  });

  test('maneja JSON inválido/corrupto en localStorage de forma segura (bloque catch)', () => {
    localStorage.setItem('user', 'invalid-json{');
    localStorage.setItem('token', 'saved-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // El usuario debe ser nulo debido al error en el parseo, pero la app no debe colapsar
    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(screen.getByTestId('token').textContent).toBe('saved-token'); // El token no requiere parseo y sobrevive
    
    // El item corrupto debió ser eliminado del localStorage
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('la función login actualiza el estado interno y el localStorage', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);

    fireEvent.click(screen.getByText('Login'));

    expect(screen.getByTestId('user').textContent).toBe('Juan');
    expect(screen.getByTestId('token').textContent).toBe('fake-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify({ nombre: 'Juan' }));
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  test('la función logout limpia el estado interno y el localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ nombre: 'Pedro' }));
    localStorage.setItem('token', 'token-pedro');

    render(<AuthProvider><TestComponent /></AuthProvider>);

    expect(screen.getByTestId('user').textContent).toBe('Pedro');

    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(screen.getByTestId('token').textContent).toBe('no-token');
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});