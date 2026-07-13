import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { PageHeader } from "../components/SharedUi";
import FormularioActividad from "../components/actividades/FormularioActividad";
import {
  getActividades,
  createActividad,
  updateActividad,
  deleteActividad,
} from "../services/actividadService";
import { useAuth } from "../context/AuthContext";

const TIPO_LABEL = { quimica: "Química", biologia: "Biología", teorica: "Teórica" };
const TIPO_COLOR = {
  quimica:  "bg-blue-50 text-blue-700 border border-blue-200",
  biologia: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  teorica:  "bg-violet-50 text-violet-700 border border-violet-200",
};
const ESTADO_LABEL  = { planificada: "Planificada", en_proceso: "En proceso", finalizada: "Finalizada" };
const ESTADO_COLOR  = {
  planificada: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  en_proceso:  "bg-blue-50 text-blue-700 border border-blue-200",
  finalizada:  "bg-slate-100 text-slate-500 border border-slate-200",
};

const TABS = [
  { key: "", label: "Todas" },
  { key: "planificada", label: "Planificadas" },
  { key: "en_proceso",  label: "En proceso" },
  { key: "finalizada",  label: "Finalizadas" },
];

export default function Actividades() {
  const { user } = useAuth();
  const puedeEditar = ["ADMIN", "PERSONAL"].includes(user?.rol);

  const [actividades, setActividades]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState("");
  const [errorOperacion, setErrorOperacion] = useState("");
  const [modalAbierto, setModalAbierto]   = useState(false);
  const [actividadEditando, setActividadEditando] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getActividades();
      setActividades(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // Filtro local (igual que pedidos filtra por tab)
  const lista = tab ? actividades.filter((a) => a.estado === tab) : actividades;

  const planificadas = actividades.filter((a) => a.estado === "planificada");
  const enProceso    = actividades.filter((a) => a.estado === "en_proceso");
  const finalizadas  = actividades.filter((a) => a.estado === "finalizada");

  const abrirNueva  = () => { setActividadEditando(null); setModalAbierto(true); };
  const abrirEditar = (a)  => { setActividadEditando(a);  setModalAbierto(true); };
  const cerrarModal = () => { setModalAbierto(false); setActividadEditando(null); };

  const handleGuardar = async (datos) => {
    if (actividadEditando) {
      await updateActividad(actividadEditando._id || actividadEditando.id, datos);
    } else {
      await createActividad(datos);
    }
    cerrarModal();
    cargar();
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta actividad?")) return;
    try {
      await deleteActividad(id);
      setActividades((prev) => prev.filter((a) => (a._id || a.id) !== id));
    } catch (err) {
      const msg = err.response?.data?.error || "No se pudo eliminar la actividad.";
      setErrorOperacion(msg);
      setTimeout(() => setErrorOperacion(""), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Cargando actividades...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 px-4 sm:px-6 lg:px-8 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <PageHeader title="Actividades" />
        {puedeEditar && (
          <button
            onClick={abrirNueva}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-200 text-emerald-600 bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm"
          >
            + Nueva actividad
          </button>
        )}
      </div>

      {/* ERROR DE OPERACIÓN */}
      {errorOperacion && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex justify-between items-center">
          <span><strong>Error:</strong> {errorOperacion}</span>
          <button onClick={() => setErrorOperacion("")} className="ml-4 text-red-400 hover:text-red-600 font-bold">✕</button>
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">Total</p>
          <p className="text-2xl font-bold">{actividades.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">Planificadas</p>
          <p className="text-2xl font-bold">{planificadas.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">En proceso</p>
          <p className="text-2xl font-bold">{enProceso.length}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === key
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-slate-500 bg-white border border-slate-200 hover:text-emerald-600 hover:border-emerald-200"
            }`}
          >
            {key === "planificada" ? `Planificadas (${planificadas.length})`
              : key === "en_proceso" ? `En proceso (${enProceso.length})`
              : key === "finalizada" ? `Finalizadas (${finalizadas.length})`
              : label}
          </button>
        ))}
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-30 rounded-[2rem]" />
        <div className="relative z-10 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-lg p-8 md:p-10">
          <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700 rounded-sm" />

          {lista.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
              <p className="text-xl font-bold text-emerald-700">Sin actividades</p>
              <p className="text-sm mt-2">No hay actividades para mostrar en esta vista.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lista.map((a) => {
                const id = a._id || a.id;
                return (
                  <div
                    key={id}
                    className="relative bg-white border border-slate-200 rounded-3xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    {/* Cabecera tarjeta */}
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-base font-bold text-slate-800 leading-snug pr-2">
                        {a.nombre}
                      </h2>
                      {puedeEditar && (
                        <div className="flex gap-1 flex-shrink-0 text-slate-400">
                          <button
                            title="Editar actividad"
                            onClick={() => abrirEditar(a)}
                            className="p-1.5 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            title="Eliminar actividad"
                            onClick={() => handleEliminar(id)}
                            className="p-1.5 rounded-lg hover:text-red-500 hover:bg-red-50 transition"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TIPO_COLOR[a.tipo] || "bg-zinc-100 text-zinc-600"}`}>
                        {TIPO_LABEL[a.tipo] || a.tipo}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[a.estado] || "bg-zinc-100 text-zinc-600"}`}>
                        {ESTADO_LABEL[a.estado] || a.estado}
                      </span>
                    </div>

                    {/* Fecha */}
                    <p className="text-xs text-slate-400">
                      {a.fecha
                        ? new Date(a.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <FormularioActividad
          actividad={actividadEditando}
          onGuardar={handleGuardar}
          onCerrar={cerrarModal}
        />
      )}
    </div>
  );
}
