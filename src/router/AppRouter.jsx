import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Laboratorios from "../pages/laboratorios";
import Pedidos from "../pages/pedidos";
import LogIn from "../pages/logIn";
import Inventario from "../pages/inventario";
import Equipamiento from "../pages/equipamiento";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Dashboard />} />
        <Route path="/laboratorios/mb" element={<LaboratoriosMB />} />
        <Route path="/laboratorios/hc" element={<LaboratoriosHC />} />
        <Route path="/laboratorios/ma" element={<LaboratoriosMA />} />
        <Route path="/laboratorios/sm" element={<LaboratoriosSM />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/logIn" element={<LogIn />} />
        <Route path="/inventario" element={<Inventario />} />
      </Routes>
    </BrowserRouter>
    
  );
}

export default AppRouter;