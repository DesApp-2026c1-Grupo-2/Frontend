import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import PrivateRoute from "../components/PrivateRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import { AuthProvider } from "../context/AuthContext";

import Dashboard from "../pages/Dashboard"; /*PRUEBA */
import Pedidos from "../pages/pedidos";
import Equipamiento from "../pages/equipamiento";
import LogIn from "../pages/logIn";
import Edificios from "../pages/edificios";
import Laboratorios from "../pages/laboratorios";
import PedidoDetalle from "../pages/pedidoDetalle";

function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS SIN NAVBAR (ej: login) */}
          <Route path="/logIn" element={<LogIn />} />

          {/* RUTAS PROTEGIDAS Y CON NAVBAR */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/*" element={<Dashboard />} /> {/*PRUEBA: dashboard  */}
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

export default AppRouter;