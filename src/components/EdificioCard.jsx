import { useNavigate } from "react-router-dom";

export default function EdificioCard({ edificio }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/laboratorios/${edificio.id}`)}
      className="
        bg-white
        rounded-2xl
        p-6
        shadow-md
        hover:shadow-xl
        hover:scale-[1.02]
        transition
        cursor-pointer
      "
    >
      <h2 className="text-2xl font-bold text-gray-800">
        {edificio.nombre}
      </h2>

      <p className="text-gray-500 mt-2">
        📍 {edificio.direccion}
      </p>

      <p className="text-gray-600 mt-3">
        Aulas: {edificio.cantidadAulas}
      </p>
    </div>
  );
}