import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Edificios() {
  const navigate = useNavigate();

  const [edificios, setEdificios] = useState([
    { id: 1, nombre: "Edificio A" },
    { id: 2, nombre: "Edificio B" },
  ]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoEdificio, setNuevoEdificio] = useState("");

  const crearEdificio = (e) => {
    e.preventDefault();

    if (!nuevoEdificio.trim()) return;

    const edificio = {
      id: Date.now(),
      nombre: nuevoEdificio,
    };

    setEdificios([...edificios, edificio]);
    setNuevoEdificio("");
    setMostrarFormulario(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Edificios
        </h1>

        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition"
        >
          Crear edificio
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {edificios.map((edificio) => (
          <div
            key={edificio.id}
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
            <h2 className="text-xl font-semibold text-gray-800">
              {edificio.nombre}
            </h2>

            <p className="text-gray-500 mt-2">
              Ver laboratorios
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
            
            <h2 className="text-2xl font-bold mb-4">
              Nuevo edificio
            </h2>

            <form onSubmit={crearEdificio} className="space-y-4">
              
              <input
                type="text"
                placeholder="Nombre del edificio"
                value={nuevoEdificio}
                onChange={(e) => setNuevoEdificio(e.target.value)}
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-xl
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="
                    px-4 py-2
                    rounded-xl
                    bg-gray-200
                    hover:bg-gray-300
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="
                    px-4 py-2
                    rounded-xl
                    bg-blue-600
                    text-white
                    hover:bg-blue-700
                  "
                >
                  Crear
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}