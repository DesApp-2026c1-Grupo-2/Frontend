import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

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

// ─────────────────────────────────────────────────────────────
// Helpers para renderizar los cambios del historial
// ─────────────────────────────────────────────────────────────

const ETIQUETAS_CAMPO = {
  materia: "Materia",
  alumnos: "Alumnos",
  duracionClase: "Duración de clase",
  fechaHora: "Fecha y hora",
  laboratorio: "Laboratorio",
  horario: "Horario",
  recursos: "Materiales/equipos",
  estado: "Estado",
};

const formatValorSimple = (valor) => {
  if (valor === null || valor === undefined) return "—";
  // Si parece una fecha ISO la formateamos
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}T/.test(valor)) {
    const d = new Date(valor);
    if (!isNaN(d.getTime())) {
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  }
  if (typeof valor === "object" && valor !== null) {
    // ObjectId u objeto poblado → intentar extraer un nombre legible
    return valor.nombre || valor.email || valor._id?.toString() || JSON.stringify(valor);
  }
  return String(valor);
};

const CambioCampoSimple = ({ campo, antes, despues }) => (
  <div className="flex flex-wrap items-center gap-1 text-sm py-0.5">
    <span className="font-medium text-slate-700">
      {ETIQUETAS_CAMPO[campo] || campo}:
    </span>
    <span className="text-slate-500 line-through">{formatValorSimple(antes)}</span>
    <span className="text-slate-400 mx-1">→</span>
    <span className="text-slate-800">{formatValorSimple(despues)}</span>
  </div>
);

const CambioHorario = ({ antes, despues }) => {
  const fmtRango = (obj) => {
    if (!obj) return "—";
    const ini = obj.inicio ? new Date(obj.inicio) : null;
    const fin = obj.fin ? new Date(obj.fin) : null;
    if (!ini || isNaN(ini)) return "—";
    const h = (d) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (!fin || isNaN(fin)) return `${ini.toLocaleDateString()} ${h(ini)}`;
    return `${ini.toLocaleDateString()} de ${h(ini)} a ${h(fin)}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm py-0.5">
      <span className="font-medium text-slate-700">Horario:</span>
      <span className="text-slate-500 line-through">{fmtRango(antes)}</span>
      <span className="text-slate-400 mx-1">→</span>
      <span className="text-slate-800">{fmtRango(despues)}</span>
    </div>
  );
};

const CambioRecursos = ({ antes, despues }) => {
  const renderLista = (lista, color) => {
    if (!Array.isArray(lista) || lista.length === 0)
      return <span className="text-slate-400 italic">sin recursos</span>;
    return (
      <ul className={`space-y-1 ${color}`}>
        {lista.map((r, i) => {
          const id =
            typeof r.recursoId === "object"
              ? r.recursoId?.nombre || r.recursoId?._id
              : r.recursoId;
          return (
            <li key={i} className="text-xs flex items-start gap-1 break-words">
              <span className="font-bold shrink-0">•</span>
              <span className="flex-1">
                <span className="font-medium">{r.tipoRecurso}</span> — <span className="break-all">{id || "recurso"}</span> ×{r.cantidad}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="text-sm py-0.5">
      <span className="font-medium text-slate-700">Materiales/equipos:</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 border border-slate-200 rounded-lg p-3 bg-slate-50">
        <div>
          <p className="text-xs text-slate-400 mb-2 font-semibold">Antes</p>
          {renderLista(antes, "text-slate-500")}
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-2 font-semibold">Después</p>
          {renderLista(despues, "text-slate-700")}
        </div>
      </div>
    </div>
  );
};

/**
 * Renderiza todos los cambios de un evento del historial.
 * Soporta: campos simples, horario (objeto anidado) y recursos (array).
 */
const RenderCambios = ({ cambios }) => {
  if (!cambios || Object.keys(cambios).length === 0) return null;

  return (
    <div className="mt-2 border-t border-slate-200 pt-2 space-y-1">
      {Object.entries(cambios).map(([campo, valor]) => {
        // Horario — objeto con {inicio, fin}
        if (campo === "horario") {
          return (
            <CambioHorario
              key={campo}
              antes={valor?.antes}
              despues={valor?.despues}
            />
          );
        }

        // Recursos — arrays
        if (campo === "recursos" && (Array.isArray(valor?.antes) || Array.isArray(valor?.despues))) {
          return (
            <CambioRecursos
              key={campo}
              antes={valor?.antes}
              despues={valor?.despues}
            />
          );
        }

        // Campos simples con estructura {antes, despues}
        if (valor !== null && typeof valor === "object" && "antes" in valor && "despues" in valor) {
          return (
            <CambioCampoSimple
              key={campo}
              campo={campo}
              antes={valor.antes}
              despues={valor.despues}
            />
          );
        }

        // Fallback — valor plano
        return (
          <div key={campo} className="text-sm py-0.5">
            <span className="font-medium text-slate-700">
              {ETIQUETAS_CAMPO[campo] || campo}:
            </span>{" "}
            <span className="text-slate-700">{formatValorSimple(valor)}</span>
          </div>
        );
      })}
    </div>
  );
};

// Etiqueta de color por acción
const ACCION_ESTILO = {
  CREACION: "bg-emerald-100 text-emerald-700",
  MODIFICACION: "bg-blue-100 text-blue-700",
  CAMBIO_ESTADO: "bg-yellow-100 text-yellow-700",
  APROBACION: "bg-emerald-100 text-emerald-700",
  RECHAZO: "bg-red-100 text-red-700",
  FINALIZACION: "bg-purple-100 text-purple-700",
  COMENTARIO: "bg-slate-100 text-slate-600",
  ELIMINACION: "bg-red-100 text-red-700",
};

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────

export default function PedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [conflictos, setConflictos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nombresRecursos, setNombresRecursos] = useState({});
  const [errorAccion, setErrorAccion] = useState("");
  const [historialExpandido, setHistorialExpandido] = useState(true);
  const [mostrarMotivRechazo, setMostrarMotivRechazo] = useState(false);
  const [motivRechazo, setMotivRechazo] = useState("");

  const tieneConflictos = conflictos.length > 0;

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await api.get(`/pedido/${id}`);
        setPedido(res.data);
        setConflictos(res.data.conflictos || []);

        if (res.data.recursos && res.data.recursos.length > 0) {
          const nombresMap = {};
          await Promise.all(
            res.data.recursos.map(async (r) => {
              const recId =
                typeof r.recursoId === "object"
                  ? r.recursoId?._id
                  : r.recursoId;

              if (r.recursoId && typeof r.recursoId === "object" && r.recursoId.nombre) {
                nombresMap[recId] = r.recursoId.nombre;
                return;
              }

              const tipo = r.tipoRecurso?.toLowerCase() || r.tipo?.toLowerCase();
              if (recId && tipo) {
                try {
                  const endpoint =
                    tipo === "equipo" ? `/equipo/${recId}` : `/items/${recId}`;
                  const resRecurso = await api.get(endpoint);
                  nombresMap[recId] = resRecurso.data.nombre;
                } catch (error) {
                  console.error(`Error al obtener recurso ${recId}:`, error);
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
    setErrorAccion("");
    try {
      const res = await api.patch(`/pedido/${id}/aprobar`);
      setPedido(res.data.pedido);
      setConflictos([]);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.conflictos) setConflictos(err.response.data.conflictos);
      setErrorAccion(err.response?.data?.error || "No se pudo aprobar el pedido.");
    }
  };

  const rechazar = async () => {
    if (!mostrarMotivRechazo) {
      setMostrarMotivRechazo(true);
      return;
    }
    
    if (!motivRechazo.trim()) {
      setErrorAccion("Debe proporcionar un motivo de rechazo.");
      return;
    }
    
    setErrorAccion("");
    try {
      // Primero rechazamos el pedido
      const res = await api.patch(`/pedido/${id}/estado`, { estado: "Rechazado" });
      setPedido(res.data);
      
      // Luego agregamos el comentario con el motivo
      await api.post(`/pedido/${id}/comentarios`, {
        mensaje: `**Motivo de rechazo:** ${motivRechazo}`,
      });
      
      // Refrescamos para obtener el historial actualizado
      const resActualizado = await api.get(`/pedido/${id}`);
      setPedido(resActualizado.data);
      
      setMostrarMotivRechazo(false);
      setMotivRechazo("");
    } catch (err) {
      console.error(err);
      setErrorAccion(err.response?.data?.error || "No se pudo rechazar el pedido.");
    }
  };

  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    setErrorAccion("");
    try {
      const res = await api.post(`/pedido/${id}/comentarios`, {
        mensaje: nuevoComentario,
      });
      setPedido((prev) => ({
        ...prev,
        comentarios: [...(prev.comentarios || []), res.data],
      }));
      setNuevoComentario("");
    } catch (err) {
      console.error(err);
      setErrorAccion(err.response?.data?.error || "No se pudo agregar el comentario.");
    }
  };

  useEffect(() => {
    const marcarVisto = async () => {
      try {
        await api.patch(`/pedido/${id}/comentarios/visto`);
      } catch (err) {
        console.error(err);
      }
    };
    marcarVisto();
  }, [id]);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!pedido) return <div className="p-6">Pedido no encontrado</div>;

  return (
    <div className="min-h-screen text-slate-800 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto">
        {/* CONTENEDOR PRINCIPAL CON DECORACIONES */}
        <div className="relative">
          <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-20 rounded-[2rem]" />
          <div className="relative z-10 bg-white border border-slate-100 rounded-[2rem] shadow-lg p-6 sm:p-8">
            <div className="absolute -top-5 left-10 right-10 h-6 bg-emerald-500 rounded-t-[1.5rem]" />
            
            {/* HEADER DENTRO DEL CARD */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-200">
              <div className="flex-1">
                <p className="text-emerald-600 font-semibold text-xs tracking-widest uppercase mb-2">Detalles del Pedido</p>
                <h1 className="text-3xl font-bold text-slate-800">{`Pedido #${(pedido._id || pedido.id || "").slice(-6)}`}</h1>
                <p className="text-slate-500 mt-2">{pedido.materia}</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition font-medium text-sm whitespace-nowrap"
              >
                ← Volver
              </button>
            </div>

        {/* INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">
          <div>
            <p className="text-slate-400 mb-1">Docente</p>
            <p className="text-slate-700">{formatDocente(pedido.docente)}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Fecha</p>
            <p className="text-slate-700">
              {formatFechaHora(pedido.fechaHora || pedido.fecha)}
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Laboratorio</p>
            <p className="text-slate-700">{formatLaboratorio(pedido.laboratorio)}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Alumnos</p>
            <p className="text-slate-700">{pedido.alumnos}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Estado</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              pedido.estado === "Aprobado" || pedido.estado === "Aceptado"
                ? "bg-emerald-100 text-emerald-700"
                : pedido.estado === "Rechazado"
                ? "bg-red-100 text-red-700"
                : pedido.estado === "Finalizado"
                ? "bg-slate-200 text-slate-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {pedido.estado === "Aceptado" ? "Aprobado" : pedido.estado}
            </span>
          </div>
        </div>

        {/* RECURSOS */}
        <div className="mb-8">
          <h2 className="font-semibold text-lg text-emerald-700 mb-4">
            🛠️ Materiales solicitados
          </h2>
          <div className="space-y-2">
            {pedido.recursos?.map((r, i) => {
              const recId =
                typeof r.recursoId === "object" ? r.recursoId?._id : r.recursoId;
              const nombreRecurso =
                r.recursoId?.nombre ||
                r.recurso?.nombre ||
                nombresRecursos[recId] ||
                r.nombre ||
                "Recurso";
              return (
                <div
                  key={i}
                  className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">{nombreRecurso}</p>
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

        {/* CONFLICTOS — alerta general */}
        {!tieneConflictos ? (
          <div className="mb-8 border border-emerald-300 bg-emerald-50 rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-emerald-700">✅ Pedido satisfacible</p>
            <p className="text-sm text-emerald-600 mt-1">
              El laboratorio, materiales y equipos se encuentran disponibles.
            </p>
          </div>
        ) : (
          <div className="mb-8 border border-red-300 bg-red-50 rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-red-700">⚠️ Pedido con conflictos</p>
            <p className="text-sm text-red-600 mt-1">
              Existen problemas que impiden satisfacer este pedido.
            </p>
          </div>
        )}

        {/* CONFLICTOS — detalle */}
        {tieneConflictos && (
          <div className="mb-8">
            <h2 className="font-semibold text-sm text-red-600 mb-3">
              Conflictos detectados
            </h2>
            <div className="space-y-2">
              {conflictos.map((c, i) => (
                <div
                  key={i}
                  className="border border-red-300 bg-red-50 rounded-lg p-3"
                >
                  <p className="text-sm text-red-700">{c.mensaje}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        <div className="mb-8">
          <h2 className="font-semibold text-lg text-emerald-700 mb-4">
            ✓ Checklist de seguimiento
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

        {/* ─────────────────────────────────────────────────────
            HISTORIAL DE ACTIVIDAD — versión timeline
        ───────────────────────────────────────────────────── */}
        <div className="mb-8">
          <button
            onClick={() => setHistorialExpandido(!historialExpandido)}
            className="flex items-center gap-2 w-full text-left mb-4 p-3 hover:bg-emerald-50 rounded-lg transition"
          >
            <span className="font-semibold text-lg text-emerald-700">📋 Historial de actividad</span>
            <span className={`text-emerald-600 transition-transform ml-auto text-xl ${
              historialExpandido ? "rotate-180" : ""
            }`}>
              ▼
            </span>
          </button>

          {historialExpandido && (
            Array.isArray(pedido.historial) && pedido.historial.length > 0 ? (
              <div className="relative">
                {/* Línea vertical */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-200" />
                
                <div className="space-y-4">
                  {[...pedido.historial]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((evento, index) => (
                      <div
                        key={index}
                        className="pl-16 animate-in fade-in slide-in-from-left duration-300"
                      >
                        {/* Punto en la línea */}
                        <div className="absolute left-1.5 top-2 w-10 h-10 bg-white border-4 border-emerald-400 rounded-full flex items-center justify-center shadow-md">
                          <div className="w-4 h-4 bg-emerald-400 rounded-full" />
                        </div>

                        {/* Tarjeta de evento */}
                        <div className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2 flex-wrap flex-1">
                              {evento.accion && (
                                <span
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                                    ACCION_ESTILO[evento.accion] ||
                                    "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {evento.accion}
                                </span>
                              )}
                              <p className="font-semibold text-slate-800 break-words">
                                {evento.descripcion}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                              {evento.createdAt
                                ? new Date(evento.createdAt).toLocaleString()
                                : "—"}
                            </span>
                          </div>

                          {/* Usuario */}
                          <p className="text-xs text-slate-500 mb-3 font-medium">
                            👤 {evento.usuario?.nombre} {evento.usuario?.apellido}
                            {evento.usuario?.rol && (
                              <span className="text-emerald-600 ml-1">· {evento.usuario.rol}</span>
                            )}
                          </p>

                          {/* Cambios */}
                          {evento.cambios &&
                            Object.keys(evento.cambios).length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <RenderCambios cambios={evento.cambios} />
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 text-center">
                <p className="text-sm text-slate-500">
                  No hay actividad registrada.
                </p>
              </div>
            )
          )}
        </div>

        {/* COMENTARIOS */}
        <div className="mb-8">
          <h2 className="font-semibold text-lg text-emerald-700 mb-4">💬 Comentarios</h2>
          <div className="space-y-3 mb-6">
            {pedido.comentarios?.map((comentario) => {
              const esMotivRechazo = comentario.mensaje?.includes("Motivo de rechazo");
              return (
              <div
                key={comentario._id}
                className={`border rounded-xl p-4 hover:shadow-md transition-all ${
                  esMotivRechazo 
                    ? "border-red-300 bg-gradient-to-br from-red-50 to-orange-50" 
                    : "border-slate-200 bg-gradient-to-br from-white to-slate-50"
                }`}
              >
                <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        esMotivRechazo
                          ? "bg-red-200 text-red-700"
                          : comentario.usuario?.rol === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : comentario.usuario?.rol === "PERSONAL"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {esMotivRechazo ? "⚠️ RECHAZO" : comentario.usuario?.rol}
                    </span>
                    <span className={`font-semibold ${
                      esMotivRechazo ? "text-red-700" : "text-slate-800"
                    }`}>
                      {comentario.usuario?.nombre} {comentario.usuario?.apellido}
                    </span>
                  </div>
                  <span className={`text-xs ${
                    esMotivRechazo ? "text-red-400" : "text-slate-400"
                  }`}>
                    {new Date(comentario.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed font-medium ${
                  esMotivRechazo ? "text-red-700" : "text-slate-700"
                }`}>{comentario.mensaje}</p>
              </div>
            );
            })}
          </div>

          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50">
            <p className="text-sm font-semibold text-emerald-900 mb-3">Agregar comentario</p>
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              rows={3}
              placeholder="Escribí un comentario..."
              className="w-full border border-emerald-300 rounded-lg p-3 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <button
              onClick={enviarComentario}
              className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              Comentar
            </button>
          </div>
        </div>

        {/* ACCIONES */}
        {PENDING_STATES.includes(pedido.estado) && (
          <div className="border-t border-slate-200 pt-6 flex flex-col gap-3">
            {errorAccion && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-600 text-sm rounded-xl flex justify-between items-start">
                <span><strong>⚠️ Error:</strong> {errorAccion}</span>
                <button onClick={() => setErrorAccion("")} className="ml-4 text-red-400 hover:text-red-600 font-bold text-lg">✕</button>
              </div>
            )}
            
            {mostrarMotivRechazo && (
              <div className="border border-red-300 bg-red-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-red-700">¿Por qué está rechazando este pedido?</p>
                <textarea
                  value={motivRechazo}
                  onChange={(e) => setMotivRechazo(e.target.value)}
                  rows={3}
                  placeholder="Escribí el motivo del rechazo..."
                  className="w-full border border-red-300 rounded-lg p-3 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={rechazar}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-md"
                  >
                    Rechazar con motivo
                  </button>
                  <button
                    onClick={() => {
                      setMostrarMotivRechazo(false);
                      setMotivRechazo("");
                    }}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            
            {!mostrarMotivRechazo && (
              <div className="flex gap-3">
                <button
                  onClick={aprobar}
                  disabled={tieneConflictos}
                  title={
                    tieneConflictos
                      ? "No se puede aprobar mientras existan conflictos"
                      : "Aprobar pedido"
                  }
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-all font-semibold shadow-md ${
                    tieneConflictos
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg"
                  }`}
                >
                  ✅ Aprobar
                </button>
                <button
                  onClick={rechazar}
                  className="flex-1 px-4 py-2.5 border-2 border-red-400 text-red-600 hover:bg-red-50 rounded-lg transition-all font-semibold"
                >
                  ❌ Rechazar
                </button>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
