import { useEffect, useState } from "react";

function Laboratorios() {
  const [laboratorios, setLaboratorios] = useState([]);
  const [filtro, setFiltro] = useState("Todos");

  useEffect(() => {
    // reemplazar esto por la API
    setLaboratorios([
      { id: 1, nombre: "Laboratorio A1", capacidad: 30, reservasHoy: 0, estado: "Disponible" },
      { id: 2, nombre: "Laboratorio A2", capacidad: 25, reservasHoy: 1, estado: "Ocupado" },
      { id: 3, nombre: "Laboratorio B1", capacidad: 40, reservasHoy: 0, estado: "Disponible" },
      { id: 4, nombre: "Laboratorio B2", capacidad: 20, reservasHoy: 2, estado: "Mantenimiento" },
      { id: 5, nombre: "Laboratorio C1", capacidad: 35, reservasHoy: 0, estado: "Disponible" },
    ]);
  }, []);

  // filtror laboratorios según el estado seleccionado
  const laboratoriosFiltrados =
    filtro === "Todos"
      ? laboratorios
      : laboratorios.filter((l) => l.estado === filtro);

  return (
    <div className="p-6 space-y-6">

      {/*  Header */}
      <div>
        <h1 className="text-2xl font-semibold">Laboratorios</h1>
        <p className="text-gray-500">
          Estado y disponibilidad de los laboratorios
        </p>
      </div>

      {/*  Cards resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-semibold">{laboratorios.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Disponibles</p>
          <p className="text-xl font-semibold">
            {laboratorios.filter(l => l.estado === "Disponible").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Ocupados</p>
          <p className="text-xl font-semibold">
            {laboratorios.filter(l => l.estado === "Ocupado").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Mantenimiento</p>
          <p className="text-xl font-semibold">
            {laboratorios.filter(l => l.estado === "Mantenimiento").length}
          </p>
        </div>
      </div>

      {/*  Filtros */}
      <div className="flex gap-2">
        {["Todos", "Disponible", "Ocupado", "Mantenimiento"].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-3 py-1 text-sm rounded-full border transition ${
              filtro === estado
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {estado}
          </button>
        ))}
      </div>

      {/*  Lista */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-medium mb-4">
          Estado de Laboratorios
        </h2>

        <div className="space-y-4">
          {laboratoriosFiltrados.map((lab) => (
            <div
              key={lab.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              {/*  Info izquierda */}
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              
                </div>

                <div>
                  <p className="font-medium">{lab.nombre}</p>
                  <p className="text-sm text-gray-500">
                    Capacidad: {lab.capacidad} alumnos
                  </p>
                </div>
              </div>

              {/* Info derecha */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {lab.reservasHoy} reservas hoy
                </span>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    lab.estado === "Disponible"
                      ? "bg-green-100 text-green-600"
                      : lab.estado === "Ocupado"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {lab.estado}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/*  Mensaje si no hay resultados */}
        {laboratoriosFiltrados.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            No hay laboratorios para este filtro
          </p>
        )}
      </div>
    </div>
  );
}

export default Laboratorios;