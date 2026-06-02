import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import NuevoPedidoForm from "../components/NuevoPedidoForm";
import EstadoBadge from "../components/EstadoBadge";
import { PageHeader } from "../components/SharedUi";

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

export default function PedidosLaboratorio() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("todos");
  const [showNuevo, setShowNuevo] = useState(false);
  const [labsDisponibles, setLabsDisponibles] = useState([]);

  const pendientes = pedidos.filter((p) =>
    PENDING_STATES.includes(p.estado)
  );

  const lista = tab === "pendientes" ? pendientes : pedidos;

  // GET pedidos + labs
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const [resPedidos, resLabs] = await Promise.all([
          api.get("/pedido"),
          api.get("/laboratorio/disponibles"),
        ]);

        setPedidos(resPedidos.data);
        setLabsDisponibles(resLabs.data || []);
      } catch (error) {
        console.error("Error al cargar pedidos:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const aprobar = async (id) => {
    try {
      const res = await api.patch(`/pedido/${id}/aprobar`);

      setPedidos((ps) =>
        ps.map((p) =>
          (p._id || p.id) === id ? res.data.pedido : p
        )
      );
    } catch (error) {
      console.error("Error al aprobar:", error.message);
      alert("Error al aprobar el pedido");
    }
  };

  const rechazar = async (id) => {
    try {
      const res = await api.patch(`/pedido/${id}/estado`, {
        estado: "Rechazado",
      });

      setPedidos((ps) =>
        ps.map((p) =>
          (p._id || p.id) === id ? res.data : p
        )
      );
    } catch (error) {
      console.error("Error al rechazar:", error.message);
      alert("Error al rechazar el pedido");
    }
  };

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
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Cargando pedidos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader title="Pedidos" />

      {/* TABS */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
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
            {t === "todos" ? (
              "Todos"
            ) : (
              <span className="flex items-center gap-2">
                Pendientes
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {pendientes.length}
                </span>
              </span>
            )}
          </button>
        ))}

        <button
          onClick={() => setShowNuevo(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium border border-emerald-200 text-emerald-600 bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors ml-1 shadow-sm"
        >
          + Nuevo pedido
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  "ID",
                  "MATERIA",
                  "DOCENTE",
                  "FECHA/HORA",
                  "LAB",
                  "ALUMNOS",
                  "ESTADO",
                  "ACCIONES",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left text-xs font-semibold text-slate-500 px-5 py-3"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {lista.map((p, i) => {
                const id = p._id || p.id;

                return (
                  <tr
                    key={id || i}
                    className={`border-b border-slate-100 hover:bg-emerald-50/40 transition-colors ${
                      i % 2 ? "bg-slate-50/30" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {id?.slice(-6)}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {p.materia}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDocente(p.docente)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatFechaHora(p.fechaHora || p.fecha)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatLaboratorio(p.laboratorio)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {p.alumnos}
                    </td>

                    <td className="px-5 py-4">
                      <EstadoBadge estado={p.estado} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {/* VER DETALLE (PÁGINA) */}
                        <button
                          onClick={() => navigate(`/pedidos/${id}`)}
                          className="px-3 py-1.5 text-xs border rounded-lg bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                        >
                          Ver
                        </button>

                        {/* ACCIONES */}
                        {PENDING_STATES.includes(p.estado) && (
                          <>
                            <button
                              onClick={() => aprobar(id)}
                              className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                            >
                              Aprobar
                            </button>

                            <button
                              onClick={() => rechazar(id)}
                              className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NUEVO PEDIDO */}
      {showNuevo && (
        <NuevoPedidoForm
          onClose={() => setShowNuevo(false)}
          onCrear={crearPedido}
          labs={labsDisponibles}
        />
      )}
    </div>
  );
}