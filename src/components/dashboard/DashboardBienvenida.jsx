import { useAuth } from "../../context/AuthContext";

import {
  FiSmile,
} from "react-icons/fi";

export default function DashboardBienvenida() {
  const { user } = useAuth();

  const mensajes = {
        DOCENTE: {
            titulo: "Todo listo para empezar",
            descripcion:
            "Consultá tus pedidos y las reservas de cada laboratorio para organizar tus clases.",
        },

        PERSONAL: {
            titulo: "¿Qué querés hacer hoy?",
            descripcion:
            "Administrá pedidos, reservas y el estado del equipamiento desde un solo lugar.",
        },

        ADMIN: {
            titulo: "Panel de administración",
            descripcion:
            "Gestioná usuarios, reservas, pedidos y equipamiento del sistema.",
        },
    };

    const contenido =
    mensajes[user?.rol] ?? {
        titulo: "Bienvenido",
        descripcion: "Accedé a toda la información desde tu panel principal.",
    };

  return (
    <div className="relative h-full">

      {/* Techo */}
      <div className="absolute -top-4 left-10 right-10 h-5 bg-stone-700 rounded-t-2xl" />

      {/* Contenido */}
      <div
        className="
          relative
          h-full
          min-h-[180px]
          bg-white
          border border-slate-200
          rounded-3xl
          shadow-sm
          px-8
          flex
          items-center
        "
      >
        <div>
          <h1 className="text-3xl font-bold font-['Playfair_Display',serif] text-emerald-800">
            Hola, {user?.nombre}{" "}
            <FiSmile className="inline text-amber-500" />
          </h1>

          <p className="mt-3 text-lg font-medium text-slate-700">
            {contenido.titulo}
          </p>

          <p className="mt-2 text-slate-500">
            {contenido.descripcion}
        </p>
        </div>
      </div>

    </div>
  );
}