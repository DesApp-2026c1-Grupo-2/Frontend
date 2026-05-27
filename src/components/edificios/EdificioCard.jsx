import { useNavigate } from "react-router-dom";

export default function EdificioCard({ edificio }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate(`/edificios/${edificio.id}/laboratorios`)
      }
      className="
        bg-white border border-slate-200 rounded-2xl
        p-6 cursor-pointer
        shadow-sm hover:shadow-md
        hover:bg-slate-50
        transition-all duration-200
      "
    >
      <h2 className="text-lg font-semibold text-slate-800">
        {edificio.nombre}
      </h2>

      <p className="text-slate-500 mt-2 text-sm">
        {edificio.direccion}
      </p>

      <p className="text-slate-600 mt-3 text-sm">
        Laboratorios: {edificio.cantidadLaboratorios}
      </p>
    </div>
  );
}