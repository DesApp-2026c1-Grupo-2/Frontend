import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import NuevoPedidoForm from "../components/NuevoPedidoForm";
import { PageHeader } from "../components/SharedUi";

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

//ESTO VA PORQUE EL BACK DICE ACEPTADO Y EL FRONT APROBADO
const normalizarEstado = (estado) => {
  if (!estado) return "Pendiente";

  switch (estado) {
    case "Aceptado":
      return "Aprobado";
    case "En revisión":
      return "En Revisión";
    default:
      return estado;
  }
};

export default function PedidosLaboratorio() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("todos");
  const [showNuevo, setShowNuevo] = useState(false);

  const pendientes = pedidos.filter((p) =>
    PENDING_STATES.includes(p.estado)
  );

  const lista = tab === "pendientes" ? pendientes : pedidos;

  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);


  // GET pedidos + labs
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
      setShowNuevo(false);
    } catch (error) {
      console.error("Error al crear:", error.message);
      alert("Error al crear el pedido");
      throw error; 
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Cargando pedidos...
      </div>
    );
  }

  const handleEditar = (pedido) => {
    setPedidoEditando(pedido);
    setShowForm(true);
  }; 
  
  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Eliminar este pedido?");
    if (!confirmar) return;

    try {
      await api.delete(`/pedido/${id}`);

      setPedidos((prev) =>
        prev.filter((p) => (p._id || p.id) !== id)
      );
    } catch (error) {
        console.error("Error al eliminar pedido:", error.response?.data || error);
        alert("No tenés permisos para eliminar este pedido");
      }
  };

  // formData debe recibirse como parámetro desde el componente que hace el submit
  const handleGuardar = async (formData) => {
    try {
      await api.put(`/pedido/${pedidoEditando._id || pedidoEditando.id}`, {
        ...pedidoEditando,
        ...formData
      });

      const res = await api.get("/pedido");
      setPedidos(res.data);

      setShowForm(false);
      setPedidoEditando(null);
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
    }
  };

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
          {pedidos.filter(p => normalizarEstado(p.estado) === "Aprobado").length}
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

      {/* BASE */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-30 rounded-[2rem]" />

      {/* CONTENIDO */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] shadow-lg p-8 md:p-10">

        {/* TECHO */}
        <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700 rounded-sm"/>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {lista.map((p) => {
            const id = p._id || p.id;
            const estado = normalizarEstado(p.estado);

            return (
              <div
                key={id}
                className="
                  relative bg-white border border-slate-200
                  rounded-3xl p-5 shadow-md
                  hover:shadow-lg hover:-translate-y-1
                  transition-all
                "
              >

                {/* TITULO */}
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-bold text-slate-800">
                    Pedido: {id?.slice(-6)}
                  </h2>

                  <div className="flex gap-2 text-slate-500">

                    <button
                      title="Editar pedido"
                      onClick={() => handleEditar(p)}
                      className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-700 transition"
                    >
                      <FiEdit2 size={16} />
                    </button>

                    <button
                      title="Eliminar pedido"
                      onClick={() => handleEliminar(id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-red-600 transition"
                    >
                      <FiTrash2 size={16} />
                    </button>

                  </div>

                </div>

                {/* SUBTITULO */}
                <p className="text-sm text-emerald-700 mt-1 font-medium">
                  {p.materia}
                </p>

                {/* INFO */}
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
                    {formatFechaHora(p.fechaHora || p.fecha)}
                  </p>

                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-center mt-4">

                  <button
                    onClick={() => navigate(`/pedidos/${id}`)}
                    className="
                      px-4 py-2 text-xs rounded-xl
                      bg-emerald-50 text-emerald-700
                      border border-emerald-200
                      hover:bg-emerald-100
                      transition
                    "
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

    {/* MODAL EDITAR PEDIDO */}
    {showForm && (
      /* Si tu NuevoPedidoForm está preparado para editar, puedes pasarle los datos iniciales.
         Si tienes un componente distinto, simplemente reemplaza NuevoPedidoForm aquí. */
      <NuevoPedidoForm
        pedido={pedidoEditando}
        onClose={() => { setShowForm(false); setPedidoEditando(null); }}
        onCrear={handleGuardar}
      />
    )}
  </div>
);
} 
