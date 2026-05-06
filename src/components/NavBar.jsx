import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 w-full h-[70px] z-50 
    bg-green-50/70 backdrop-blur-lg border-b border-green-100 
    flex items-center justify-between px-8">

      {/* Logo / nombre */}
      <h1
        onClick={() => navigate("/")}
        className="text-green-800 font-bold text-lg cursor-pointer hover:text-green-900 transition"
      >
        Universidad Nacional de Hurlingham
      </h1>

      {/* Botones */}
      <div className="flex gap-6">
        <button
          onClick={() => navigate("/inventario")}
          className="text-green-700 font-medium hover:text-green-900 transition"
        >
          Inventario
        </button>

        <button
          onClick={() => navigate("/equipamiento")}
          className="text-green-700 font-medium hover:text-green-900 transition"
        >
          Equipamiento
        </button>

        <button
          onClick={() => navigate("/pedidos")}
          className="text-green-700 font-medium hover:text-green-900 transition"
        >
          Pedidos
        </button>

        <button
          onClick={() => navigate("/logIn")}
          className="text-green-700 font-medium hover:text-green-900 transition"
        >
          LogIn
        </button>
      </div>
    </div>
  );
}

export default Navbar;