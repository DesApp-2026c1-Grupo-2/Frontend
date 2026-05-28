import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import EstadoBadge from "../components/EstadoBadge";

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
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export default function PedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await api.get(`/pedido/${id}`);
        setPedido(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id]);

  const aprobar = async () => {
    const res = await api.patch(`/pedido/${id}/aprobar`);
    setPedido(res.data.pedido);
  };

  const rechazar = async () => {
    const res = await api.patch(`/pedido/${id}/estado`, {
      estado: "Rechazado",
    });
    setPedido(res.data);
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!pedido) return <div className="p-6">Pedido no encontrado</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="max-w-3xl mx-auto bg-white border rounded-2xl shadow-sm p-6">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <div>
            <h1 className="text-lg font-semibold">
              Pedido #{(pedido._id || "").slice(-6)}
            </h1>
            <p className="text-slate-500">{pedido.materia}</p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ← Volver
          </button>
        </div>

        {/* INFO */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-slate-400">Docente</p>
            <p>{formatDocente(pedido.docente)}</p>
          </div>

          <div>
            <p className="text-slate-400">Fecha</p>
            <p>{formatFechaHora(pedido.fechaHora || pedido.fecha)}</p>
          </div>

          <div>
            <p className="text-slate-400">Laboratorio</p>
            <p>{formatLaboratorio(pedido.laboratorio)}</p>
          </div>

          <div>
            <p className="text-slate-400">Alumnos</p>
            <p>{pedido.alumnos}</p>
          </div>

          <div>
            <p className="text-slate-400">Estado</p>
            <EstadoBadge estado={pedido.estado} />
          </div>
        </div>

        {/* RECURSOS */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-2">
            Materiales solicitados
          </h2>

          <div className="space-y-2">
            {pedido.recursos?.map((r, i) => (
              <div
                key={i}
                className="flex justify-between border rounded-lg p-2"
              >
                <div>
                  <p className="text-sm">
                    {r.nombre || r.recursoId?.nombre || "Recurso"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.tipo || r.tipoRecurso || "—"}
                  </p>
                </div>
                <span className="text-xs font-bold">x{r.cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHECKLIST (placeholder listo para tu backend) */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-2">
            Checklist de seguimiento
          </h2>

          <div className="space-y-2 text-sm text-slate-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Preparación del laboratorio
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Materiales entregados
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Pedido finalizado
            </label>
          </div>
        </div>

        {/* ACCIONES */}
        {PENDING_STATES.includes(pedido.estado) && (
          <div className="flex gap-2">
            <button
              onClick={aprobar}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
            >
              Aprobar
            </button>

            <button
              onClick={rechazar}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg"
            >
              Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}