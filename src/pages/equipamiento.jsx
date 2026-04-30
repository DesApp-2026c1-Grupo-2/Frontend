import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const tabs = ["Equipos", "Materiales", "Reactivos", "Sustancias basicas"];

const initialInventoryData = [
  {
    id: 1,
    categoria: "Equipos",
    tipo: "Centrifuga",
    cantidad: 1,
    codigo: "EQ-001",
    ubicacion: "Lab 1 / Edif. A",
    estado: "Disponible",
    movilidad: "Fija",
  },
  {
    id: 2,
    categoria: "Equipos",
    tipo: "Microscopio binocular",
    cantidad: 1,
    codigo: "EQ-002",
    ubicacion: "Lab 2 / Edif. A",
    estado: "Reservado",
    movilidad: "Movible",
  },
  {
    id: 3,
    categoria: "Equipos",
    tipo: "Incubadora bacteriologica",
    cantidad: 1,
    codigo: "EQ-003",
    ubicacion: "Lab 3 / Edif. B",
    estado: "Disponible",
    movilidad: "Fija",
  },
  {
    id: 4,
    categoria: "Equipos",
    tipo: "Espectrofotometro UV",
    cantidad: 1,
    codigo: "EQ-004",
    ubicacion: "Lab 5 / Edif. C",
    estado: "Fuera de servicio",
    movilidad: "Fija",
  },
  {
    id: 5,
    categoria: "Equipos",
    tipo: "Bano termostatico",
    cantidad: 1,
    codigo: "EQ-005",
    ubicacion: "Lab 1 / Edif. A",
    estado: "Mantenimiento",
    movilidad: "Movible",
  },
  {
    id: 6,
    categoria: "Materiales",
    tipo: "Gradilla de tubos",
    cantidad: 1,
    codigo: "MT-011",
    ubicacion: "Deposito central",
    estado: "Disponible",
    movilidad: "Movible",
  },
  {
    id: 7,
    categoria: "Reactivos",
    tipo: "Buffer fosfato",
    cantidad: 1,
    codigo: "RC-023",
    ubicacion: "Camara fria 2",
    estado: "Reservado",
    movilidad: "Fija",
  },
  {
    id: 8,
    categoria: "Sustancias basicas",
    tipo: "Acido citrico",
    cantidad: 1,
    codigo: "SB-008",
    ubicacion: "Almacen quimico",
    estado: "Disponible",
    movilidad: "Fija",
  },
];

const statusOptions = ["Disponible", "Reservado", "Fuera de servicio", "Mantenimiento"];

function SearchIcon() {/* icono lupa*/ 
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {/* icono lápiz*/ 
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20h4l10-10a2 2 0 10-4-4L4 16v4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {/* icono tacho*/
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V5h6v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusPill({ status }) {/* estado con colores*/
  const statusMap = {
    Disponible: "bg-emerald-100 text-emerald-700",
    Reservado: "bg-amber-100 text-amber-700",
    "Fuera de servicio": "bg-rose-100 text-rose-700",
    Mantenimiento: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMap[status] || "bg-slate-100 text-slate-700"}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function MobilityPill({ mobility }) {
  const isMovible = mobility === "Movible";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isMovible ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {mobility}
    </span>
  );
}

function Equipamiento() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Equipos");
  const [query, setQuery] = useState("");
  const [inventory, setInventory] = useState(initialInventoryData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "1",
    estado: "Disponible",
  });

  const resetForm = () => {
    setFormData({
      nombre: "",
      cantidad: "1",
      estado: "Disponible",
    });
  };

  const openForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nombre = formData.nombre.trim();
    const cantidad = Number.parseInt(formData.cantidad, 10);

    if (!nombre || Number.isNaN(cantidad) || cantidad < 1) {
      return;
    }

    const codePrefix = activeTab === "Materiales" ? "MT" : activeTab === "Reactivos" ? "RC" : activeTab === "Sustancias basicas" ? "SB" : "EQ";

    setInventory((currentInventory) => {
      const nextNumber =
        currentInventory
          .filter((item) => item.categoria === activeTab)
          .reduce((maxNumber, item) => {
            const [, numericPart = "0"] = item.codigo.split("-");
            const itemNumber = Number.parseInt(numericPart, 10);

            return Number.isNaN(itemNumber) ? maxNumber : Math.max(maxNumber, itemNumber);
          }, 0) + 1;

      return [
        ...currentInventory,
        {
          id: Date.now(),
          categoria: activeTab,
          tipo: nombre,
          cantidad,
          codigo: `${codePrefix}-${String(nextNumber).padStart(3, "0")}`,
          ubicacion: "Pendiente de asignar",
          estado: formData.estado,
          movilidad: "Fija",
        },
      ];
    });

    closeForm();
    resetForm();
  };

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase(); /*Limpia y normaliza el texto ingresado.*/

    return inventory.filter((item) => { /* Filtra */
      const matchesCategory = item.categoria === activeTab; /* Filtra Categoría */
      const matchesQuery = /* Filtra Búsqueda */
        !normalizedQuery ||
        item.tipo.toLowerCase().includes(normalizedQuery) ||
        item.codigo.toLowerCase().includes(normalizedQuery) ||
        item.ubicacion.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeTab, inventory, query]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Equipamiento</h1>
          <button  /* Boton de página principal */
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600"
          >
            Volver al inicio
          </button>
        </div>

        <div className="mb-5 inline-flex w-full flex-wrap rounded-xl border border-slate-200 bg-slate-100 p-1">
          {tabs.map((tab) => { /* Recorre las categorias */
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)} /* Cambia la pestaña activa */
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <input /* Campo de búsqueda */
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar ${activeTab.toLowerCase().slice(0, -1)}...`}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <button   /* Boton nuevo equipo   NO TIENE FUNCIONALIDAD AÚN*/
            type="button"
            onClick={openForm}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
          > + Nuevo equipo
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Cantidad</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Codigo</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Ubicacion</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Estado</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Movilidad</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                
                {filteredItems.map((item) => ( /* Recorre los items filtrados y los muestra en la tabla */  
                  <tr key={item.id} className="border-t border-slate-100 text-sm text-slate-700">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.tipo}</td>
                    <td className="px-4 py-3 text-slate-500">{item.cantidad}</td>
                    <td className="px-4 py-3 text-slate-500">{item.codigo}</td>
                    <td className="px-4 py-3 text-slate-500">{item.ubicacion}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={item.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <MobilityPill mobility={item.movilidad} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 p-2 text-slate-500 transition hover:border-cyan-400 hover:text-cyan-600"
                          aria-label={`Editar ${item.tipo}`}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 p-2 text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                          aria-label={`Eliminar ${item.tipo}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
                
        {filteredItems.length === 0 && ( /* Mensaje cuando no hay resultados */ 
          <p className="mt-4 text-center text-sm text-slate-500">
            No hay resultados para el filtro seleccionado.
          </p>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={closeForm}>
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Nuevo equipo</h2>
                <p className="mt-1 text-sm text-slate-500">Completa el formulario para registrar el equipo.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                Cerrar
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Nombre</span>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(event) => setFormData((current) => ({ ...current, nombre: event.target.value }))}
                  placeholder="Ej. Micropipeta digital"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Cantidad</span>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(event) => setFormData((current) => ({ ...current, cantidad: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Estado</span>
                <select
                  value={formData.estado}
                  onChange={(event) => setFormData((current) => ({ ...current, estado: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
                >
                  Guardar equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Equipamiento;