import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-lime-200/80 bg-[#b9d89b]/95 backdrop-blur-md shadow-[0_6px_24px_rgba(50,80,20,0.08)]">
      <div className="mx-auto flex h-[78px] w-full max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40"
          aria-label="Ir al inicio"
        >
          <img
            src={logo}
            alt="Universidad Nacional de Hurlingham"
            className="h-[52px] w-auto object-contain sm:h-[58px]"
          />
        </button>

        <nav className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/")}
            className="rounded-xl px-4 py-2 text-base font-semibold text-slate-900 transition hover:bg-white/35 hover:text-green-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40"
          >
            Inicio
          </button>

          <button
            onClick={() => navigate("/equipamiento")}
            className="rounded-xl px-4 py-2 text-base font-semibold text-slate-900 transition hover:bg-white/35 hover:text-green-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40"
          >
            Equipamiento
          </button>

          <button
            onClick={() => navigate("/pedidos")}
            className="rounded-xl bg-[#94c463] px-5 py-2.5 text-base font-semibold text-slate-950 shadow-[0_6px_16px_rgba(72,110,28,0.18)] transition hover:bg-[#85b957] hover:shadow-[0_10px_24px_rgba(72,110,28,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-800/40"
          >
            Pedidos
          </button>

          <button
            onClick={() => navigate("/logIn")}
            className="rounded-xl border-2 border-green-700 bg-transparent px-5 py-2.5 text-base font-semibold text-slate-950 transition hover:border-green-800 hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40"
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;