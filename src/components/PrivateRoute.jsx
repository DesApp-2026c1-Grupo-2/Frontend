import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute() {

  const { user, loading } = useAuth();

  // Mientras verifica el token
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si terminó de verificar y no hay usuario
  if (!user) {
    return <Navigate to="/logIn" replace />;
  }

  // Usuario autenticado
  return <Outlet />;
}

export default PrivateRoute;