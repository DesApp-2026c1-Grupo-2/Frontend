import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import NuevoPedidoForm from "../components/pedidos/NuevoPedidoForm";
import EditarPedidoForm from "../components/pedidos/EditarPedidoForm";
import { PageHeader } from "../components/SharedUi";
import { useAuth } from "../context/AuthContext";

import {
  FiUser,
  FiHome,
  FiUsers,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiMessageCircle,
} from "react-icons/fi";

const PENDING_STATES = ["Pendiente"];

const formatDocente = (doc) => {
  if (!doc) return "—";
  if (typeof doc === "string") return doc;
  return `${doc.nombre || ""} ${doc.apellido || ""}`.trim() || doc.email || "—";
};

const formatLaboratorio = (lab) => {
  if (!lab) return "—";
  if (typeof lab === "string") return lab;
  return lab.nombre || "—";
};

const formatRangoHorario = (p) => {
  const fechaHoraStr = p.fechaHora || p.fecha;
  if (!fechaHoraStr) return "—";
  const inicio = new Date(fechaHoraStr);
  if (isNaN(inicio.getTime())) return fechaHoraStr;
  const horaInicio = inicio.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  let horaFin = null;
  if (typeof p.duracionClase === "number") {
    const fin = new Date(inicio.getTime() + p.duracionClase * 60 * 1000);
    horaFin = fin.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (!horaFin) return `${inicio.toLocaleDateString()} a las ${horaInicio}`;
  return `${inicio.toLocaleDateString()} de ${horaInicio} a ${horaFin}`;
};

const normalizarEstado = (estado) => {
  if (!estado) return "Pendiente";
  switch (estado) {
    case "Aceptado": return "Aprobado";
    // Añadimos traducciones/formatos para los nuevos si hiciera falta:
    case "Cancelado": return "Cancelado";
    case "Expirado": return "Expirado";
    default: return estado;
  }
};

export default function PedidosLaboratorio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [showNuevo, setShowNuevo] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [errorOperacion, setErrorOperacion] = useState("");

  // Ordenar por más reciente primero
  const pedidosOrdenados = [...pedidos].sort(
    (a, b) => new Date(b.fechaHora || b.createdAt) - new Date(a.fechaHora || a.createdAt)
  );

  const pendientes  = pedidos.filter((p) => PENDING_STATES.includes(p.estado));
  const aprobados   = pedidos.filter((p) => normalizarEstado(p.estado) === "Aprobado");
  const rechazados  = pedidos.filter((p) => p.estado === "Rechazado");
  const expirados   = pedidos.filter((p) => p.estado === "Expirado");
  const finalizados = pedidos.filter((p) => p.estado === "Finalizado");

  const TABS = [
    { key: "todos",       label: "Todos",       count: pedidos.length },
    { key: "pendientes",  label: "Pendientes",  count: pendientes.length },
    { key: "aprobados",   label: "Aprobados",   count: aprobados.length },
    { key: "rechazados",  label: "Rechazados",  count: rechazados.length },
    { key: "expirados",   label: "Expirados",   count: expirados.length },
    { key: "finalizados", label: "Finalizados", count: finalizados.length },
  ];

  const porTab = {
    todos:       pedidosOrdenados,
    pendientes:  pedidosOrdenados.filter((p) => PENDING_STATES.includes(p.estado)),
    aprobados:   pedidosOrdenados.filter((p) => normalizarEstado(p.estado) === "Aprobado"),
    rechazados:  pedidosOrdenados.filter((p) => p.estado === "Rechazado"),
    expirados:   pedidosOrdenados.filter((p) => p.estado === "Expirado"),
    finalizados: pedidosOrdenados.filter((p) => p.estado === "Finalizado"),
  };

  // Filtro de búsqueda por ID
  const lista = busqueda.trim()
    ? porTab[tab].filter((p) =>
        (p._id || p.id)?.toString().toLowerCase().includes(busqueda.trim().toLowerCase())
      )
    : porTab[tab];

  const POR_PAGINA = 9;
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const listaPaginada = lista.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const resPedidos = await api.get("/pedido");
        setPedidos(resPedidos.data);
      } catch (error) {
        console.error("Error al cargar pedidos:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const crearPedido = async (datosFormulario) => {
    try {
      const res = await api.post("/pedido", {
        ...datosFormulario,
        estado: "Pendiente",
      });
      setPedidos((prev) => [...prev, res.data]);

    } catch (error) {
      console.error("Error al crear:", error.message);
      throw error; 
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Eliminar este pedido?");
    if (!confirmar) return;
    try {
      await api.delete(`/pedido/${id}`);
      setPedidos((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (error) {
      console.error("Error al eliminar pedido:", error.response?.data || error);
      const msg = error.response?.status === 403
        ? "No tenés permisos para eliminar este pedido."
        : error.response?.data?.error || "No se pudo eliminar el pedido.";
      setErrorOperacion(msg);
      setTimeout(() => setErrorOperacion(""), 4000);
    }
  };

  // ─── handleGuardar CORREGIDO ────────────────────────────────────────────────
  // Recibe el payload ya limpio desde EditarPedidoForm (solo IDs, nunca objetos
  // poblados). NO hace spread de pedidoEditando — eso era la causa del bug.
  const handleGuardar = async (payload) => {
    const id = pedidoEditando._id || pedidoEditando.id;
    await api.put(`/pedido/${id}`, payload);
    const res = await api.get("/pedido");
    setPedidos(res.data);
    setPedidoEditando(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Cargando pedidos...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 px-4 sm:px-6 lg:px-8 py-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <PageHeader title="Pedidos" />
        <button
          onClick={() => setShowNuevo(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-200 text-emerald-600 bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm"
        >
          + Nuevo pedido
        </button>
      </div>

      {/* ERROR DE OPERACIÓN (ej: no se pudo eliminar) */}
      {errorOperacion && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex justify-between items-center">
          <span><strong>Error:</strong> {errorOperacion}</span>
          <button onClick={() => setErrorOperacion("")} className="ml-4 text-red-400 hover:text-red-600 font-bold">✕</button>
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">Pedidos</p>
          <p className="text-2xl font-bold">{pedidos.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">Pendientes</p>
          <p className="text-2xl font-bold">{pendientes.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
          <p className="text-sm text-emerald-700 font-medium">Aprobados</p>
          <p className="text-2xl font-bold">
            {pedidos.filter((p) => normalizarEstado(p.estado) === "Aprobado").length}
          </p>
        </div>
      </div>

      {/* TABS + BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10">
        <div className="flex gap-2 flex-wrap flex-1">
          {TABS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setBusqueda(""); setPagina(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-slate-500 bg-white border border-slate-200 hover:text-emerald-600 hover:border-emerald-200"
              }`}
            >
              {label}{count > 0 ? ` (${count})` : ""}
            </button>
          ))}
        </div>

        {/* Búsqueda por ID */}
        <input
          type="text"
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          placeholder="Buscar por ID..."
          className="w-full sm:w-56 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-emerald-400 transition"
        />
      </div>

      {/* CONTENEDOR */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-30 rounded-[2rem]" />
        <div className="relative z-10 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-lg p-8 md:p-10">
          <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700 rounded-sm" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* INICIO DE LA VALIDACIÓN */}
            {lista.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                <p className="text-xl font-bold text-emerald-700">Sin pedidos</p>
                <p className="text-sm mt-2">
                  {busqueda.trim()
                    ? `No se encontró ningún pedido con ID "${busqueda.trim()}".`
                    : "No hay pedidos para mostrar en esta vista."}
                </p>
              </div>
            ) : (
              listaPaginada.map((p) => {
                const id = p._id || p.id;
                const estado = normalizarEstado(p.estado);
                const esPropio =
                  p.docente?._id === user?.id || p.docente?.id === user?.id;

                const puedeEditar =
                  p.estado === "Pendiente" &&
                  (
                    user?.rol === "ADMIN" ||
                    user?.rol === "PERSONAL" ||
                    (user?.rol === "DOCENTE" && esPropio)
                  );

                return (
                  <div
                    key={id}
                    className="relative bg-white border border-slate-200 rounded-3xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-bold text-slate-800">
                        Pedido: {id?.slice(-6)}
                      </h2>
                      <div className="flex items-center gap-2">
                        {p.tieneComentariosNuevos && (
                          <span className="relative">
                            <FiMessageCircle className="text-blue-600" size={18} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                          </span>
                        )}
                        <div className="flex gap-2 text-slate-500">
                          {puedeEditar && (
                            <button
                              title="Editar pedido"
                              onClick={() => setPedidoEditando(p)}
                              className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-700 transition"
                            >
                              <FiEdit2 size={16} />
                            </button>
                          )}
                          {user?.rol !== "DOCENTE" && (
                            <button
                              title="Eliminar pedido"
                              onClick={() => handleEliminar(id)}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-600 transition"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-emerald-700 mt-1 font-medium">{p.materia}</p>

                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <FiUser className="text-slate-500" />
                        {formatDocente(p.docente)}
                      </p>
                      <p className="flex items-center gap-2">
                        <FiHome className="text-slate-500" />
                        {formatLaboratorio(p.laboratorio)}
                      </p>
                      <p className="flex items-center gap-2">
                        <FiUsers className="text-slate-500" />
                        {p.alumnos} alumnos
                      </p>
                      <p className="flex items-center gap-2">
                        <FiCalendar className="text-slate-500" />
                        {formatRangoHorario(p)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => navigate(`/pedidos/${id}`)}
                        className="px-4 py-2 text-xs rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                      >
                        Inspeccionar
                      </button>
                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium capitalize
                          ${
                            estado === "Aprobado"
                              ? "bg-emerald-100 text-emerald-700"
                              : estado === "Rechazado"
                              ? "bg-red-100 text-red-700"
                              : estado === "Finalizado"
                              ? "bg-slate-200 text-slate-700"
                              : estado === "Cancelado" 
                              ? "bg-orange-100 text-orange-700" // Color para cancelado
                              : estado === "Expirado"
                              ? "bg-gray-200 text-gray-600" // Color para expirado
                              : "bg-yellow-100 text-yellow-700" // Pendiente queda acá
                          }
                        `}
                      >
                        {estado}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            {/* FIN DE LA VALIDACIÓN */}

          </div>

          {/* PAGINADOR */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 rounded-xl text-sm border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPagina(n)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium border transition ${
                    n === paginaActual
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 rounded-xl text-sm border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Siguiente →
              </button>

              <span className="text-xs text-slate-400 ml-2">
                Página {paginaActual} de {totalPaginas} · {lista.length} pedidos
              </span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVO PEDIDO */}
      {showNuevo && (
        <NuevoPedidoForm
          onClose={() => setShowNuevo(false)}
          onCrear={crearPedido}
        />
      )}

      {/* MODAL EDITAR PEDIDO — componente dedicado */}
      {pedidoEditando && (
        <EditarPedidoForm
          pedido={pedidoEditando}
          onClose={() => setPedidoEditando(null)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
}
