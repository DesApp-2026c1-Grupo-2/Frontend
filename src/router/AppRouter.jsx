import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

import Dashboard from "../pages/Dashboard";
import LaboratoriosMB from "../pages/laboratoriosMB";
import LaboratoriosHC from "../pages/laboratoriosHC";
import LaboratoriosMA from "../pages/laboratoriosMA";
import LaboratoriosSM from "../pages/laboratoriosSM";
import Pedidos from "../pages/pedidos";
import Equipamiento from "../pages/equipamiento";
import LaboratoriosMB from "../pages/laboratoriosMB";
import LaboratoriosHC from "../pages/laboratoriosHC";
import LaboratoriosMA from "../pages/laboratoriosMA";
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
        <Route path="/equipamiento" element={<Equipamiento />} />
        <Route path="/logIn" element={<LogIn />} />
      </Routes>
    </BrowserRouter>

  );
}

export default AppRouter;