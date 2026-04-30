import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Laboratorios from "../pages/Laboratorios";
import Pedidos from "../pages/Pedidos";
import LogIn from "../pages/logIn";
import LaboratoriosHC from "../pages/laboratoriosHC";
import LaboratoriosMA from "../pages/laboratoriosMA";
import LaboratoriosMB from "../pages/laboratoriosMB";
import LaboratoriosSM from "../pages/laboratoriosSM";

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
      </Routes>
    </BrowserRouter>
    
  );
}

export default AppRouter;