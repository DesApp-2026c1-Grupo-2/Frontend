import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../../components/PrivateRoute';
import * as AuthContext from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('PrivateRoute Component', () => {
  test('redirige a /logIn si no hay usuario autenticado', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: null });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<div>Contenido Privado y Protegido</div>} />
          </Route>
          <Route path="/logIn" element={<div>Acceso Denegado - Pantalla Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Acceso Denegado - Pantalla Login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Privado y Protegido')).not.toBeInTheDocument();
  });

  test('renderiza el Outlet si el usuario está correctamente logueado', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ user: { id: 'admin-123', rol: 'ADMIN' } });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<div>Contenido Privado y Protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido Privado y Protegido')).toBeInTheDocument();
  });
});