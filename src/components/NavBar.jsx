import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./common/ConfirmModal";

import logo from "../assets/Logo.png";
import { FiUser, FiLogOut } from "react-icons/fi";


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarConfirmLogout, setMostrarConfirmLogout] = useState(false);
  const { user, logout } = useAuth();


  const canViewAdminSections = user?.rol?.toUpperCase() === "ADMIN" || user?.rol?.toUpperCase() === "PERSONAL";
  const isAdmin = user?.rol?.toUpperCase() === "ADMIN";


  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  const navButtonClass = (path) =>
    `w-full rounded-xl px-4 py-3 text-left text-base font-semibold transition
   ${location.pathname.startsWith(path)
      ? "bg-emerald-600 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;


  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-[78px] w-full max-w-[1700px] items-center justify-between gap-6 px-6 xl:px-10">
          <button
            type="button"
            onClick={() => navigate("/dashboard")} /*PRUEBA */
            className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40"
            aria-label="Ir al inicio"
          >
            <img
              src={logo}
              alt="Universidad Nacional de Hurlingham"
              className="h-[42px] w-auto object-contain"
            />
          </button>


          {/* DESKTOP NAV */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => navigate("/dashboard")} /*PRUEBA */
              className={navButtonClass("/dashboard")}
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/calendario")}
              className={navButtonClass("/calendario")}
            >
              Calendario
            </button>

            {canViewAdminSections && (
              <>
                <button
                  onClick={() => navigate("/edificios")}
                  className={navButtonClass("/edificios")}
                >
                  Edificios
                </button>

                <button
                  onClick={() => navigate("/equipamiento")}
                  className={navButtonClass("/equipamiento")}
                >
                  Equipamiento
                </button>

                <button
                  onClick={() => navigate("/actividades")}
                  className={navButtonClass("/actividades")}
                >
                  Actividades
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => navigate("/aprobacion-usuarios")}
                className={navButtonClass("/aprobacion-usuarios")}
              >
                Usuarios
              </button>
            )}


            <button
              onClick={() => navigate("/pedidos")}
              className={navButtonClass("/pedidos")}
            >
              Pedidos
            </button>


            {user && (
              <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                    <span className="font-semibold text-emerald-700">
                      {user.nombre?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>


                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-slate-800">
                      {user.nombre}
                    </p>


                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {user.rol}
                    </p>
                  </div>
                </div>


                <button
                  onClick={() => setMostrarConfirmLogout(true)}
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <FiLogOut />
                  Salir
                </button>
              </div>
            )}
          </nav>


          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="xl:hidden flex flex-col justify-center items-center gap-1.5 w-11 h-11 rounded-xl hover:bg-white/20 transition"
          >
            <span className={`block h-0.5 w-6 bg-slate-900 transition ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-6 bg-slate-900 transition ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-slate-900 transition ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>


        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 shadow-lg">
            {user && (
              <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                  {user.nombre?.charAt(0)?.toUpperCase()}
                </div>


                <div>
                  <p className="font-semibold text-slate-800">
                    {user.nombre}
                  </p>


                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {user.rol}
                  </p>
                </div>
              </div>
            )}
            <nav className="flex flex-col gap-2">

              <button
                onClick={() => {
                  navigate("/dashboard");
                  setMenuOpen(false);
                }}
                className={navButtonClass("/dashboard")}
              >
                Dashboard
              </button>

              <button
                onClick={() => {
                  navigate("/calendario");
                  setMenuOpen(false);
                }}
                className={navButtonClass("/calendario")}
              >
                Calendario
              </button>

              {canViewAdminSections && (
                <>
                  <button
                    onClick={() => {
                      navigate("/edificios");
                      setMenuOpen(false);
                    }}
                    className={navButtonClass("/edificios")}
                  >
                    Edificios
                  </button>

                  <button
                    onClick={() => {
                      navigate("/equipamiento");
                      setMenuOpen(false);
                    }}
                    className={navButtonClass("/equipamiento")}
                  >
                    Equipamiento
                  </button>

                  <button
                    onClick={() => {
                      navigate("/actividades");
                      setMenuOpen(false);
                    }}
                    className={navButtonClass("/actividades")}
                  >
                    Actividades
                  </button>
                </>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    navigate("/aprobacion-usuarios");
                    setMenuOpen(false);
                  }}
                  className={navButtonClass("/aprobacion-usuarios")}
                >
                  Usuarios
                </button>
              )}

              <button
                onClick={() => {
                  navigate("/pedidos");
                  setMenuOpen(false);
                }}
                className={navButtonClass("/pedidos")}
              >
                Pedidos
              </button>

              {user && (
                <button
                  onClick={() => {
                    setMostrarConfirmLogout(true);
                    setMenuOpen(false);
                  }}
                  className="rounded-xl border border-red-200 px-4 py-3 text-left font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Salir
                </button>
              )}

              {!user && (
                <button
                  onClick={() => {
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Login
                </button>
              )}

            </nav>
          </div>
        )}
      </header >
      <ConfirmModal
        isOpen={mostrarConfirmLogout}
        onClose={() => setMostrarConfirmLogout(false)}
        onConfirm={() => {
          setMostrarConfirmLogout(false);
          handleLogout();
        }}
        title="¿Cerrar sesión?"
        message="Se cerrará tu sesión actual y volverás a la pantalla de inicio de sesión."
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        tipo="warning"
      />
    </>
  );
}

export default Navbar;
