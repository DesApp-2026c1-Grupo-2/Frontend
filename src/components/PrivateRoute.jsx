import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute() {
  const { user } = useAuth();

  // Si no hay usuario en sesión, redirigimos directamente a /logIn
  if (!user) {
    return <Navigate to="/logIn" replace />;
  }

  // Si el usuario existe, renderizamos las rutas hijas (Outlet)
  return <Outlet />;
}

export default PrivateRoute;