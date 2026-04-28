import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Laboratorios from "../pages/Laboratorios";
import Pedidos from "../pages/Pedidos";
import LogIn from "../pages/logIn";
import Inventario from "../pages/inventario";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Dashboard />} />
        <Route path="/laboratorios" element={<Laboratorios />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/logIn" element={<LogIn />} />
        <Route path="/inventario" element={<Inventario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;