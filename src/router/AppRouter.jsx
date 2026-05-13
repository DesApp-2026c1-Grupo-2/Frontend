import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

//import Dashboard from "../pages/Dashboard";
//import LaboratoriosMB from "../pages/laboratoriosMB";
//import LaboratoriosHC from "../pages/laboratoriosHC";
//import LaboratoriosMA from "../pages/laboratoriosMA";
//import LaboratoriosSM from "../pages/laboratoriosSM";
import Pedidos from "../pages/pedidos";
import Equipamiento from "../pages/equipamiento";
import LogIn from "../pages/logIn";
import Edificios from "../pages/edificios";
import Laboratorios from "../pages/laboratorios";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS CON NAVBAR */}
        <Route element={<Layout />}>
          {/*<Route path="/*" element={<Dashboard />} />
          <Route path="/laboratorios/mb" element={<LaboratoriosMB />} />
          <Route path="/laboratorios/hc" element={<LaboratoriosHC />} />
          <Route path="/laboratorios/ma" element={<LaboratoriosMA />} />
          <Route path="/laboratorios/sm" element={<LaboratoriosSM />} />//*/}
          <Route path="/" element={<Edificios />} /> {/* primer vista del administrador?????? */}
          <Route path="/edificios/:id/laboratorios" element={<Laboratorios />} /> {/* laboratorios de un edificio específico */}
          <Route path="/edificios" element={<Edificios />} />
          <Route path="/equipamiento" element={<Equipamiento />} />
          <Route path="/pedidos" element={<Pedidos />} />
        </Route>

        {/* RUTAS SIN NAVBAR (ej: login) */}
        <Route path="/logIn" element={<LogIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;