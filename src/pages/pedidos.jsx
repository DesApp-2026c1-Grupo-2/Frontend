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

const PENDING_STATES = ["Pendiente", "En Revisión"];

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
    case "En revisión": return "En Revisión";
    default: return estado;
  }
};

export default function PedidosLaboratorio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("todos");
  const [showNuevo, setShowNuevo] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [errorOperacion, setErrorOperacion] = useState("");

  const pendientes = pedidos.filter((p) => PENDING_STATES.includes(p.estado));
  const lista = tab === "pendientes" ? pendientes : pedidos;

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
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-emerald-700 font-medium">Pedidos</p>
          <p className="text-2xl font-bold">{pedidos.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-emerald-700 font-medium">Pendientes</p>
          <p className="text-2xl font-bold">{pendientes.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-emerald-700 font-medium">Aprobados</p>
          <p className="text-2xl font-bold">
            {pedidos.filter((p) => normalizarEstado(p.estado) === "Aprobado").length}
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-10">
        {["todos", "pendientes"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-slate-500 bg-white border border-slate-200 hover:text-emerald-600 hover:border-emerald-200"
            }`}
          >
            {t === "todos" ? "Todos" : `Pendientes (${pendientes.length})`}
          </button>
        ))}
      </div>

      {/* CONTENEDOR */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-30 rounded-[2rem]" />
        <div className="relative z-10 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-lg p-8 md:p-10">
          <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700 rounded-sm" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {lista.map((p) => {
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
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                  >
                    {estado}
                  </span>
                  </div>
                </div>
              );
            })}
          </div>
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
