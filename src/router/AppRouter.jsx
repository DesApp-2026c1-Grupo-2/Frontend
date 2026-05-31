import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import PrivateRoute from "../components/PrivateRoute";
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
              <Route path="/" element={<Edificios />} /> {/* primer vista del administrador?????? */}
              <Route path="/edificios/:id/laboratorios" element={<Laboratorios />} /> {/* laboratorios de un edificio específico */}
              <Route path="/edificios" element={<Edificios />} />
              <Route path="/equipamiento" element={<Equipamiento />} />
              <Route path="/pedidos" element={<Pedidos />} />
              <Route path="/pedidos/:id" element={<PedidoDetalle />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;