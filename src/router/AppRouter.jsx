import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Laboratorios from "../pages/Laboratorios";
import Pedidos from "../pages/Pedidos";
import LogIn from "../pages/logIn";
import Equipamiento from "../pages/equipamiento";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Dashboard />} />
        <Route path="/laboratorios" element={<Laboratorios />} />
        <Route path="/equipamiento" element={<Equipamiento />}/>
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/logIn" element={<LogIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;