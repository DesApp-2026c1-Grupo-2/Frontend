import { useEffect, useState } from "react";

function Inventario() {
  const [filtro, setFiltro] = useState("Todos");
  const [inventario, setInventario] = useState([]);

  useEffect(() => {
    setInventario([
      { id: 1, nombre: "Microscopio", cantidad: 10, categoria: "Materiales" },
      { id: 2, nombre: "Tubos de ensayo", cantidad: 200, categoria: "Materiales" },
      { id: 3, nombre: "Bureta", cantidad: 15, categoria: "Materiales" },

      { id: 4, nombre: "Ácido clorhídrico", cantidad: 100, categoria: "Reactivos" },
      { id: 5, nombre: "Etanol", cantidad: 50, categoria: "Reactivos" },
      { id: 6, nombre: "NaOH", cantidad: 75, categoria: "Reactivos" },

      { id: 7, nombre: "Sodio", cantidad: 30, categoria: "Sustancias" },
      { id: 8, nombre: "Potasio", cantidad: 20, categoria: "Sustancias" },
    ]);
  }, []);

  const categorias = ["Materiales", "Reactivos", "Sustancias"];

  const filtrados =
    filtro === "Todos"
      ? inventario
      : inventario.filter((item) => item.categoria === filtro);

  const totalCantidad = filtrados.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const renderCategoriaCard = (categoria) => {
    const items = inventario.filter((i) => i.categoria === categoria);
    const total = items.reduce((acc, i) => acc + i.cantidad, 0);

    return (
      <div key={categoria} className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">{categoria}</h3>

        <p className="text-sm text-gray-500 mb-3">
          Total stock: <span className="font-medium">{total}</span>
        </p>

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm border-b pb-1"
            >
              <span>{item.nombre}</span>
              <span className="font-medium">{item.cantidad}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Inventario</h1>
        <p className="text-gray-500">Gestión de stock de laboratorio</p>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2">
        {["Todos", "Materiales", "Reactivos", "Sustancias"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`px-3 py-1 text-sm rounded-full border ${
              filtro === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* RESUMEN */}
      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-sm text-gray-500">Total de stock</p>
        <p className="text-2xl font-semibold">{totalCantidad}</p>
      </div>

      {/* CONTENIDO */}
      {filtro === "Todos" ? (
        // 👇 DASHBOARD EN GRID (LO QUE PEDISTE)
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categorias.map(renderCategoriaCard)}
        </div>
      ) : (
        // 👇 LISTA NORMAL CUANDO FILTRAS
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          {filtrados.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">{item.nombre}</p>
                <p className="text-sm text-gray-500">{item.categoria}</p>
              </div>
              <span className="font-semibold">{item.cantidad}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inventario;