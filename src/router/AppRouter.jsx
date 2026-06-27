import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import PrivateRoute from "../components/PrivateRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import { AuthProvider, useAuth } from "../context/AuthContext";

import Landing from "../pages/Landing"; // ← NUEVA pantalla de inicio
import Dashboard from "../pages/Dashboard"; /*PRUEBA */
import Pedidos from "../pages/pedidos";
import Equipamiento from "../pages/equipamiento";
import LogIn from "../pages/logIn";
import RegistroForm from "../pages/RegistroForm";
import Edificios from "../pages/edificios";
import Laboratorios from "../pages/laboratorios";
import PedidoDetalle from "../pages/pedidoDetalle";

function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTA INICIAL - Redirecciona según autenticación */}
          <Route path="/" element={<PublicHomeRoute />} />

          {/* RUTAS SIN NAVBAR (ej: login) */}
          <Route path="/logIn" element={<LogIn />} />
          <Route path="/registro" element={<RegistroForm />} />

          {/* RUTAS PROTEGIDAS Y CON NAVBAR */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} /> {/*PRUEBA: dashboard  */}
              <Route path="/pedidos" element={<Pedidos />} />
              <Route path="/pedidos/:id" element={<PedidoDetalle />} />

              {/* RUTAS PROTEGIDAS POR ROL */}
              <Route element={<RoleProtectedRoute allowedRoles={["ADMIN", "PERSONAL"]} />}>
                <Route path="/" element={<Edificios />} />
                <Route path="/edificios/:id/laboratorios" element={<Laboratorios />} />
                <Route path="/edificios" element={<Edificios />} />
                <Route path="/equipamiento" element={<Equipamiento />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Componente que redirige inteligentemente
function PublicHomeRoute() {
  const { user } = useAuth(); // Asume que tu AuthContext expone el usuario

  // Si está autenticado, redirige al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, muestra la landing
  return <Landing />;
}


export default AppRouter;