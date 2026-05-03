import Navbar from "../components/NavBar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <Navbar />
      <div className="pt-[70px]">
        <Outlet />
      </div>
    </>
  );
}

export default Layout;