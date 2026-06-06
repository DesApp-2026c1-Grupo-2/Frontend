import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import NuevoPedidoForm from "../components/NuevoPedidoForm";
import { PageHeader } from "../components/SharedUi";
import { useAuth } from "../context/AuthContext"; // Importado de la versión protegida

import {
  FiUser,
  FiHome,
  FiUsers,
  FiCalendar,
  FiEdit2,
  FiTrash2,
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

const formatFechaHora = (fechaHoraStr) => {
  if (!fechaHoraStr) return "—";
  const d = new Date(fechaHoraStr);
  if (isNaN(d.getTime())) return fechaHoraStr;
  return `${d.toLocaleDateString()} a las ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
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
  const { user } = useAuth(); // Obtenemos el usuario y su rol

  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("todos");
  
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const pendientes = pedidos.filter((p) => PENDING_STATES.includes(p.estado));
  const lista = tab === "pendientes" ? pendientes : pedidos;

  // Cargar pedidos
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

  // Función para CREAR o ACTUALIZAR (Lógica unificada)
  const handleSubmitForm = async (datosFormulario) => {
    try {
      if (pedidoEditando) {
        // MODO EDICIÓN
        const id = pedidoEditando._id || pedidoEditando.id;
        await api.put(`/pedido/${id}`, {
          ...datosFormulario,
          estado: pedidoEditando.estado, // Mantiene el estado actual
        });
      } else {
        // MODO CREACIÓN
        await api.post("/pedido", {
          ...datosFormulario,
          estado: "Pendiente",
        });
      }

      // Refrescar lista
      const res = await api.get("/pedido");
      setPedidos(res.data);
      setShowForm(false);
      setPedidoEditando(null);
    } catch (error) {
      console.error("Error en la operación:", error);
      alert(error.response?.data?.message || "Error al procesar el pedido");
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Eliminar este pedido?");
    if (!confirmar) return;
    try {
      await api.delete(`/pedido/${id}`);
      setPedidos((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch  (error) {
      alert("No tenés permisos para eliminar este pedido");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Cargando pedidos...</div>;
  }

  return (
    <div className="min-h-screen text-slate-800 px-4 sm:px-6 lg:px-8 py-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <PageHeader title="Pedidos" />
        <button
          onClick={() => {
            setPedidoEditando(null); // Reset para que sea "Nuevo"
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-200 text-emerald-600 bg-white hover:bg-emerald-50 transition-colors shadow-sm"
        >
          + Nuevo pedido
        </button>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <MetricCard label="Pedidos" value={pedidos.length} />
        <MetricCard label="Pendientes" value={pendientes.length} />
        <MetricCard 
          label="Aprobados" 
          value={pedidos.filter(p => normalizarEstado(p.estado) === "Aprobado").length} 
        />
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-10">
        {["todos", "pendientes"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-slate-500 bg-white border border-slate-200"
            }`}
          >
            {t === "todos" ? "Todos" : `Pendientes (${pendientes.length})`}
          </button>
        ))}
      </div>

      {/* LISTADO DE PEDIDOS */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-30 rounded-[2rem]" />
        <div className="relative z-10 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-lg p-8 md:p-10">
          <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700"/>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {lista.map((p) => {
              const id = p._id || p.id;
              const estado = normalizarEstado(p.estado);

              // LÓGICA DE PERMISOS
              const puedeEditar = (user?.rol === "ADMIN" || user?.rol === "PERSONAL") && 
                                  (estado === "Pendiente" || estado === "Rechazado");
              const puedeEliminar = user?.rol === "ADMIN";

              return (
                <div key={id} className="relative bg-white border border-slate-200 rounded-3xl p-5 shadow-md hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-slate-800">Pedido: {id?.slice(-6)}</h2>
                    <div className="flex gap-2">
                      <button
                        disabled={!puedeEditar}
                        onClick={() => { setPedidoEditando(p); setShowForm(true); }}
                        className={`p-1 rounded-lg transition ${puedeEditar ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-300 cursor-not-allowed"}`}
                        title={puedeEditar ? "Editar pedido" : "No tienes permisos o el pedido ya fue procesado"}
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        disabled={!puedeEliminar}
                        onClick={() => handleEliminar(id)}
                        className={`p-1 rounded-lg transition ${puedeEliminar ? "text-red-600 hover:bg-red-50" : "text-slate-300 cursor-not-allowed"}`}
                        title={puedeEliminar ? "Eliminar pedido" : "Solo administradores pueden eliminar"}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-emerald-700 mt-1 font-medium">{p.materia}</p>
                  
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><FiUser /> {formatDocente(p.docente)}</p>
                    <p className="flex items-center gap-2"><FiHome /> {formatLaboratorio(p.laboratorio)}</p>
                    <p className="flex items-center gap-2"><FiUsers /> {p.alumnos} alumnos</p>
                    <p className="flex items-center gap-2"><FiCalendar /> {formatFechaHora(p.fechaHora || p.fecha)}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => navigate(`/pedidos/${id}`)}
                      className="px-4 py-2 text-xs rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      Inspeccionar
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      estado === "Aprobado" ? "bg-emerald-100 text-emerald-700" :
                      estado === "Rechazado" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {estado}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL ÚNICO (Para crear y editar) */}
      {showForm && (
        <NuevoPedidoForm
          onClose={() => { setShowForm(false); setPedidoEditando(null); }}
          onCrear={handleSubmitForm} // Sirve para ambos casos
          pedidoInicial={pedidoEditando}
          modo={pedidoEditando ? "editar" : "crear"}
        />
      )}
    </div>
  );
}

// Componente auxiliar para las métricas
function MetricCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <p className="text-sm text-emerald-700 font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}