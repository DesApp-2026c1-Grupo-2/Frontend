import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import EstadoBadge from "../components/EstadoBadge";

const PENDING_STATES = ["Pendiente", "En Revisión"];

const formatDocente = (doc) => {
  if (!doc) return "—";
  if (typeof doc === "string") return doc;

  return (
    `${doc.nombre || ""} ${doc.apellido || ""}`.trim() ||
    doc.email ||
    "—"
  );
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
  const [conflictos, setConflictos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await api.get(`/pedido/${id}`);

        setPedido(res.data);
        setConflictos(res.data.conflictos || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id]);

  const aprobar = async () => {
    try {
      const res = await api.patch(`/pedido/${id}/aprobar`);

      setPedido(res.data.pedido);
      setConflictos([]);
    } catch (err) {
      console.error(err);

      if (err.response?.data?.conflictos) {
        setConflictos(err.response.data.conflictos);
      }

      alert(
        err.response?.data?.error ||
          "No se pudo aprobar el pedido"
      );
    }
  };

  const rechazar = async () => {
    try {
      const res = await api.patch(`/pedido/${id}/estado`, {
        estado: "Rechazado",
      });

      setPedido(res.data);
    } catch (err) {
      console.error(err);

      alert("No se pudo rechazar el pedido");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Cargando...
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="p-6">
        Pedido no encontrado
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Pedido #{(pedido._id || pedido.id || "").slice(-6)}
            </h1>

            <p className="text-slate-500 mt-1">
              {pedido.materia}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ← Volver
          </button>
        </div>

        {/* INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">

          <div>
            <p className="text-slate-400 mb-1">
              Docente
            </p>

            <p className="text-slate-700">
              {formatDocente(pedido.docente)}
            </p>
          </div>

          <div>
            <p className="text-slate-400 mb-1">
              Fecha
            </p>

            <p className="text-slate-700">
              {formatFechaHora(
                pedido.fechaHora || pedido.fecha
              )}
            </p>
          </div>

          <div>
            <p className="text-slate-400 mb-1">
              Laboratorio
            </p>

            <p className="text-slate-700">
              {formatLaboratorio(pedido.laboratorio)}
            </p>
          </div>

          <div>
            <p className="text-slate-400 mb-1">
              Alumnos
            </p>

            <p className="text-slate-700">
              {pedido.alumnos}
            </p>
          </div>

          <div>
            <p className="text-slate-400 mb-1">
              Estado
            </p>

            <EstadoBadge estado={pedido.estado} />
          </div>
        </div>

        {/* RECURSOS */}
        <div className="mb-8">
          <h2 className="font-semibold text-sm text-slate-700 mb-3">
            Materiales solicitados
          </h2>

          <div className="space-y-2">
            {pedido.recursos?.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {r.recursoId?.nombre ||
                      r.nombre ||
                      "Recurso"}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {r.tipo ||
                      r.tipoRecurso ||
                      "—"}
                  </p>
                </div>

                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                  x{r.cantidad}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CONFLICTOS */}
        {conflictos.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-sm text-red-600 mb-3">
              Conflictos detectados
            </h2>

            <div className="space-y-2">
              {conflictos.map((c, i) => (
                <div
                  key={i}
                  className="border border-red-200 bg-red-50 rounded-lg p-3"
                >
                  <p className="text-sm text-red-700">
                    {c.mensaje}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        <div className="mb-8">
          <h2 className="font-semibold text-sm text-slate-700 mb-3">
            Checklist de seguimiento
          </h2>

          <div className="space-y-3 text-sm text-slate-600">

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Preparación del laboratorio
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Materiales entregados
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Pedido finalizado
            </label>

          </div>
        </div>

        {/* ACCIONES */}
        {PENDING_STATES.includes(pedido.estado) && (
          <div className="flex gap-3">

            <button
              onClick={aprobar}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Aprobar
            </button>

            <button
              onClick={rechazar}
              className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Rechazar
            </button>

          </div>
        )}

      </div>
    </div>
  );
}