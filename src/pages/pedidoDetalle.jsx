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
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nombresRecursos, setNombresRecursos] = useState({});

  const tieneConflictos = conflictos.length > 0;

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await api.get(`/pedido/${id}`);

        setPedido(res.data);
        setConflictos(res.data.conflictos || []);

        // Si el backend no pobla el nombre del recurso, lo buscamos manualmente
        if (res.data.recursos && res.data.recursos.length > 0) {
          const nombresMap = {};
          await Promise.all(
            res.data.recursos.map(async (r) => {
              const recId = typeof r.recursoId === "object" ? r.recursoId?._id : r.recursoId;
              
              // Si ya viene con el nombre, lo guardamos y salimos
              if (r.recursoId && typeof r.recursoId === "object" && r.recursoId.nombre) {
                nombresMap[recId] = r.recursoId.nombre;
                return;
              }

              // Si solo tenemos el ID, vamos a buscarlo a su respectiva API
              const tipo = r.tipoRecurso?.toLowerCase() || r.tipo?.toLowerCase();
              if (recId && tipo) {
                try {
                  const endpoint = tipo === "equipo" ? `/equipo/${recId}` : `/items/${recId}`;
                  const resRecurso = await api.get(endpoint);
                  nombresMap[recId] = resRecurso.data.nombre;
                } catch (error) {
                  console.error(`Error al obtener info del recurso ${recId}:`, error);
                }
              }
            })
          );
          setNombresRecursos(nombresMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id]);

  const aprobar = async () => {
    if (tieneConflictos) return;

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

  const enviarComentario = async () => {
    try {

      if (!nuevoComentario.trim()) return;

      const res = await api.post(
        `/pedido/${id}/comentarios`,
        {
          mensaje: nuevoComentario,
        }
      );

      setPedido(prev => ({
        ...prev,
        comentarios: [
          ...(prev.comentarios || []),
          res.data,
        ]
      }));

      setNuevoComentario("");

    } catch (err) {
      console.error(err);

      alert("No se pudo agregar el comentario");
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
            {pedido.recursos?.map((r, i) => {
              const recId = typeof r.recursoId === "object" ? r.recursoId?._id : r.recursoId;
              const nombreRecurso = r.recursoId?.nombre || r.recurso?.nombre || nombresRecursos[recId] || r.nombre || "Recurso";

              return (
                <div
                  key={i}
                  className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {nombreRecurso}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {r.tipo || r.tipoRecurso || "—"}
                    </p>
                  </div>

                  <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                    x{r.cantidad}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONFLICTOS */}
        {/* ALERTA GENERAL */}
        {!tieneConflictos ? (
          <div className="mb-8 border border-green-200 bg-green-50 rounded-lg p-4">
            <p className="font-semibold text-green-700">
              ✓ Pedido satisfacible
            </p>

            <p className="text-sm text-green-600 mt-1">
              El laboratorio, materiales y equipos se encuentran disponibles.
            </p>
          </div>
        ) : (
          <div className="mb-8 border border-red-200 bg-red-50 rounded-lg p-4">
            <p className="font-semibold text-red-700">
              ⚠ Pedido con conflictos
            </p>

            <p className="text-sm text-red-600 mt-1">
              Existen problemas que impiden satisfacer este pedido.
            </p>
          </div>
        )}

        {/* CONFLICTOS DETALLADOS */}

        {tieneConflictos && (
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

          {pedido.checklist?.length > 0 ? (
            <div className="space-y-3">
              {pedido.checklist.map((tarea, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={tarea.estado === "Completada"}
                      readOnly
                      className="h-4 w-4 accent-emerald-600"
                    />

                    <div>
                      <p
                        className={`text-sm font-medium ${
                          tarea.estado === "Completada"
                            ? "text-slate-500 line-through"
                            : "text-slate-700"
                        }`}
                      >
                        {tarea.descripcion}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Tipo: {tarea.tipo}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      tarea.estado === "Completada"
                        ? "bg-green-100 text-green-700"
                        : tarea.estado === "En Proceso"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tarea.estado}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-sm text-slate-500">
                No hay tareas generadas para este pedido.
              </p>
            </div>
          )}
        </div>

        {/* comentarios */}
        <div className="mb-8">
          <h2 className="font-semibold text-sm text-slate-700 mb-3">
            Comentarios
          </h2>

          <div className="space-y-3">
            {pedido.comentarios?.map((comentario) => (
              <div
                key={comentario._id}
                className="border border-slate-200 rounded-lg p-3"
              >
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">

                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold
                        ${
                          comentario.usuario?.rol === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : comentario.usuario?.rol === "PERSONAL"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }
                      `}
                    >
                      {comentario.usuario?.rol}
                    </span>

                    <span className="font-medium text-slate-700">
                      {comentario.usuario?.nombre}{" "}
                      {comentario.usuario?.apellido}
                    </span>

                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(comentario.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-slate-600">
                  {comentario.mensaje}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              rows={3}
              placeholder="Escribí un comentario..."
              className="
                w-full
                border
                border-slate-300
                rounded-lg
                p-3
                text-sm
                text-slate-800
                placeholder:text-slate-400
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

            <button
              onClick={enviarComentario}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Comentar
            </button>
          </div>          
        </div>        

        {/* ACCIONES */}
        {PENDING_STATES.includes(pedido.estado) && (
          <div className="flex gap-3">

            <button
              onClick={aprobar}
              disabled={tieneConflictos}
              title={
                tieneConflictos
                  ? "No se puede aprobar mientras existan conflictos"
                  : "Aprobar pedido"
              }
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                tieneConflictos
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
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