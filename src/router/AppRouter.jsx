import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Laboratorios from "../pages/laboratorios";
import Pedidos from "../pages/pedidos";
import LogIn from "../pages/logIn";
import Equipamiento from "../pages/equipamiento";
import LaboratoriosMB from "../pages/laboratoriosMB";
import LaboratoriosHC from "../pages/laboratoriosHC";
import LaboratoriosMA from "../pages/laboratoriosMA";
import LaboratoriosSM from "../pages/laboratoriosSM";


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/laboratorios/mb" element={<LaboratoriosMB />} />
        <Route path="/laboratorios/hc" element={<LaboratoriosHC />} />
        <Route path="/laboratorios/ma" element={<LaboratoriosMA />} />
        <Route path="/laboratorios/sm" element={<LaboratoriosSM />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/equipamiento" element={<Equipamiento />} />
      </Routes>
    </BrowserRouter>

  );
}

export default AppRouter;
