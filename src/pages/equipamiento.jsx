import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

const tabs = [
  { label: "Equipos", icon: DeviceTabIcon },
  { label: "Materiales", icon: BoxTabIcon },
  { label: "Reactivos", icon: FlaskTabIcon },
  { label: "Sustancias basicas", icon: PillTabIcon },
];

const initialInventoryData = [
  { id: 1, categoria: "Equipos", tipo: "Centrifuga", codigo: "EQ-001", ubicacion: "Lab 1 / Edif. A", estado: "Disponible", movilidad: "Fija", cantidad: 1 },
  { id: 2, categoria: "Equipos", tipo: "Microscopio binocular", codigo: "EQ-002", ubicacion: "Lab 2 / Edif. A", estado: "Reservado", movilidad: "Movible", cantidad: 1 },
  { id: 3, categoria: "Equipos", tipo: "Incubadora bacteriologica", codigo: "EQ-003", ubicacion: "Lab 3 / Edif. B", estado: "Disponible", movilidad: "Fija", cantidad: 1 },
  { id: 4, categoria: "Equipos", tipo: "Espectrofotometro UV", codigo: "EQ-004", ubicacion: "Lab 5 / Edif. C", estado: "Fuera de servicio", movilidad: "Fija", cantidad: 1 },
  { id: 5, categoria: "Equipos", tipo: "Bano termostatico", codigo: "EQ-005", ubicacion: "Lab 1 / Edif. A", estado: "Mantenimiento", movilidad: "Movible", cantidad: 1 },
  { id: 6, categoria: "Materiales", tipo: "Gradilla de tubos", codigo: "MT-011", ubicacion: "Deposito central", estado: "Disponible", movilidad: "Movible", cantidad: 1 },
  { id: 7, categoria: "Reactivos", tipo: "Buffer fosfato", codigo: "RC-023", ubicacion: "Camara fria 2", estado: "Reservado", movilidad: "Fija", cantidad: 1 },
  { id: 8, categoria: "Sustancias basicas", tipo: "Acido citrico", codigo: "SB-008", ubicacion: "Almacen quimico", estado: "Disponible", movilidad: "Fija", cantidad: 1 },
];

const statusOptions = ["Disponible", "Reservado", "Fuera de servicio", "Mantenimiento"];

/* ─── Iconos generales ─── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20h4l10-10a2 2 0 10-4-4L4 16v4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V5h6v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Iconos para los tabs ─── */
function DeviceTabIcon() { // Ícono de dispositivo para "Equipos"
  return (
    <svg class="w-6 h-6 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1M9 12H4m8 8V9h8v11h-8Zm0 0H9m8-4a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"/>
    </svg>

  );
}

function BoxTabIcon() { // Ícono de caja para "Materiales"
  return (
    <svg class="w-6 h-6 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11H4m15.5 5a.5.5 0 0 0 .5-.5V8a1 1 0 0 0-1-1h-3.75a1 1 0 0 1-.829-.44l-1.436-2.12a1 1 0 0 0-.828-.44H8a1 1 0 0 0-1 1M4 9v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-3.75a1 1 0 0 1-.829-.44L9.985 8.44A1 1 0 0 0 9.157 8H5a1 1 0 0 0-1 1Z"/>
    </svg>

  );
}

function FlaskTabIcon() { // Ícono de matraz para "Reactivos"
  return (
    <svg class="w-6 h-6 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8.737 8.737a21.49 21.49 0 0 1 3.308-2.724m0 0c3.063-2.026 5.99-2.641 7.331-1.3 1.827 1.828.026 6.591-4.023 10.64-4.049 4.049-8.812 5.85-10.64 4.023-1.33-1.33-.736-4.218 1.249-7.253m6.083-6.11c-3.063-2.026-5.99-2.641-7.331-1.3-1.827 1.828-.026 6.591 4.023 10.64m3.308-9.34a21.497 21.497 0 0 1 3.308 2.724m2.775 3.386c1.985 3.035 2.579 5.923 1.248 7.253-1.336 1.337-4.245.732-7.295-1.275M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
    </svg>

  );
}

function PillTabIcon() { // Ícono genérico de pastilla para "Sustancias básicas"
  return (
    <svg class="w-6 h-6 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.05 3.00002v5C7.33127 8.93351 5.05005 11.2392 5.05005 14.2c0 3.7555 3.13401 6.8 6.99995 6.8 3.866 0 7-3.0445 7-6.8 0-2.9608-2.2812-5.26649-5-6.19998v-5m-4 0h4m-4 0H8.05005m5.99995 0h2M5.09798 15H19.0021"/>
    </svg>

  );
}

/* ─── Iconos para stats ─── */
function DeviceIcon() {
  return (
    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" strokeLinecap="round" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.18a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l6 3.09a2 2 0 0 0 2 0l6-3.09A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v2" strokeLinecap="round" />
      <path d="M16 2v2" strokeLinecap="round" />
      <path d="M12 7v9" strokeLinecap="round" />
      <path d="M5 21h14" strokeLinecap="round" />
      <path d="M8 11a4 4 0 0 0 8 0L12 3 8 11z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Ícono "i" para alertas ─── */
function InfoIcon({ colorClass = "text-amber-500" }) {
  return (
    <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-current ${colorClass}`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 8h.01M12 12v4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ─── Pills de estado ─── */
function StatusPill({ status }) {
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
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isMovible ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {mobility}
    </span>
  );
}

/* ─── Alerta individual con colores por estado ─── */
function AlertCard({ item }) {
  const styleMap = {
    Reservado: {
      bg: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-500",
    },
    "Fuera de servicio": {
      bg: "bg-rose-50 border-rose-200",
      iconColor: "text-rose-500",
    },
    Mantenimiento: {
      bg: "bg-yellow-50 border-yellow-200",
      iconColor: "text-yellow-500",
    },
  };

  const style = styleMap[item.estado] || { bg: "bg-slate-50 border-slate-200", iconColor: "text-slate-400" };

  return (
    <div className={`rounded-xl border p-3 ${style.bg}`}>
      <div className="flex items-center gap-3">
        <InfoIcon colorClass={style.iconColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">{item.tipo}</span>
            <StatusPill status={item.estado} />
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            Código {item.codigo} · {item.ubicacion} · 1 unidad
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
function Equipamiento() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Equipos");
  const [query, setQuery] = useState("");
  const [inventory, setInventory] = useState(initialInventoryData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", cantidad: "1", estado: "Disponible" });

  const resetForm = () => setFormData({ nombre: "", cantidad: "1", estado: "Disponible" });
  const openForm = () => { resetForm(); setIsFormOpen(true); };
  const closeForm = () => setIsFormOpen(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nombre = formData.nombre.trim();
    const cantidad = Number.parseInt(formData.cantidad, 10);
    if (!nombre || Number.isNaN(cantidad) || cantidad < 1) return;

    const codePrefix = activeTab === "Materiales" ? "MT" : activeTab === "Reactivos" ? "RC" : activeTab === "Sustancias basicas" ? "SB" : "EQ";

    setInventory((current) => {
      const nextNumber = current
        .filter((item) => item.categoria === activeTab)
        .reduce((max, item) => {
          const [, num = "0"] = item.codigo.split("-");
          const n = Number.parseInt(num, 10);
          return Number.isNaN(n) ? max : Math.max(max, n);
        }, 0) + 1;

      return [...current, {
        id: Date.now(),
        categoria: activeTab,
        tipo: nombre,
        cantidad,
        codigo: `${codePrefix}-${String(nextNumber).padStart(3, "0")}`,
        ubicacion: "Pendiente de asignar",
        estado: formData.estado,
        movilidad: "Fija",
      }];
    });

    closeForm();
    resetForm();
  };

  const alertItems = inventory.filter((i) => i.estado !== "Disponible");

  const stats = [
    { title: "Equipos registrados", value: inventory.filter(i => i.categoria === "Equipos").length, subtitle: "Inventario general", hex: "#06b6d4" },
    { title: "Materiales", value: inventory.filter(i => i.categoria === "Materiales").length, subtitle: "Categoría activa", hex: "#4f46e5" },
    { title: "Reactivos", value: inventory.filter(i => i.categoria === "Reactivos").length, subtitle: "Categoría activa", hex: "#f59e0b" },
    { title: "Alertas activas", value: alertItems.length, subtitle: "Estados por revisar", hex: "#f43f5e" },
  ];

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return inventory.filter((item) => {
      const matchesCategory = item.categoria === activeTab;
      const matchesQuery =
        !normalizedQuery ||
        item.tipo.toLowerCase().includes(normalizedQuery) ||
        item.codigo.toLowerCase().includes(normalizedQuery) ||
        item.ubicacion.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeTab, inventory, query]);

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Equipamiento</h1>
        <Button variant="outline" size="md" onClick={() => navigate("/")}>Volver al inicio</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
            <Card key={s.title} padding="none" className="p-5 rounded-2xl shadow-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{s.title}</div>
                <div className="text-5xl font-black leading-none" style={{ color: s.hex }}>{s.value}</div>
                <div className="mt-3 text-sm text-slate-500">{s.subtitle}</div>
              </div>
            </Card>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla principal */}
        <div className="lg:col-span-2">
          <Card padding="md" className="p-4 sm:p-5">
            {/* Título de sección */}
            <div className="mb-4 flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Últimos movimientos de stock</h2>
                <p className="text-xs text-slate-400 mt-0.5">Usa tus filtros para ver por categoría los registros cargados.</p>
              </div>
              <button
                type="button"
                onClick={openForm}
                className="mt-2 sm:mt-0 shrink-0 inline-flex items-center gap-2 rounded-full border-2 border-cyan-400 bg-cyan-50 px-5 py-2.5 text-sm font-bold text-cyan-600 tracking-wide hover:bg-cyan-500 hover:text-white hover:border-cyan-500 hover:shadow-[0_0_18px_rgba(6,182,212,0.45)] active:scale-95 transition-all duration-250 cursor-pointer"
              >
                <span className="text-base leading-none font-black">+</span>
                Nuevo equipo
              </button>
            </div>

            {/* Tabs con íconos */}
            <div className="mb-4 flex w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm gap-1">
              {tabs.map(({ label, icon }) => {
                const TabIcon = icon;
                const isActive = label === activeTab;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveTab(label)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200 font-semibold"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className={isActive ? "text-slate-700" : "text-slate-400"}>
                      <TabIcon />
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Búsqueda */}
            <div className="mb-5 relative w-full max-w-sm">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar equipo..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse">
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
                    {filteredItems.map((item) => (
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
                              className="rounded-lg p-2 text-cyan-500 bg-cyan-50 hover:bg-cyan-100 transition"
                              aria-label={`Editar ${item.tipo}`}
                            >
                              <PencilIcon />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 transition"
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

            {filteredItems.length === 0 && (
              <p className="mt-4 text-center text-sm text-slate-500">No hay resultados para el filtro seleccionado.</p>
            )}
          </Card>
        </div>

        {/* Panel de alertas */}
        <div>
          <Card padding="md" className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Alertas de inventario</h2>
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-600">
                {alertItems.length} activas
              </span>
            </div>
            <p className="mb-4 text-sm text-slate-500">Estados que requieren revisión o mantenimiento.</p>

            <div className="flex flex-col gap-3">
              {alertItems.map((item) => (
                <AlertCard key={item.id} item={item} />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal formulario */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Nuevo {activeTab.slice(0, -1).toLowerCase()}</h2>
                <p className="mt-1 text-sm text-slate-500">Completa el formulario para registrar el ítem.</p>
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
                  onChange={(e) => setFormData((c) => ({ ...c, nombre: e.target.value }))}
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
                  onChange={(e) => setFormData((c) => ({ ...c, cantidad: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Estado</span>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData((c) => ({ ...c, estado: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
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
                  Guardar
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