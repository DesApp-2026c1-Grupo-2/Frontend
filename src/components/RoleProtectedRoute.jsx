import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  // Si no hay sesión activa, redirigimos al login
  if (!user) {
    return <Navigate to="/logIn" replace />;
  }

  // Si el usuario no tiene un rol permitido, lo enviamos de regreso al Dashboard
  if (allowedRoles && !allowedRoles.includes(user.rol?.toUpperCase())) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;