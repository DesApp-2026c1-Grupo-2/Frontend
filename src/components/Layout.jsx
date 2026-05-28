import Navbar from "../components/NavBar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="pt-[70px] px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;