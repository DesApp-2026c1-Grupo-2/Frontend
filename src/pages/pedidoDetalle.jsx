import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ResumenValorHistorial } from "../utils/historialFormat";

const PENDING_STATES = ["Pendiente"];

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
  reporteFinal: "Reporte final",
};

const formatValorSimple = (valor, nombresPorId = {}) => {
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}T/.test(valor)) {
    const d = new Date(valor);
    if (!isNaN(d.getTime())) {
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  }

  if (typeof valor === "string" && nombresPorId[valor]) {
    return nombresPorId[valor];
  }

  if (typeof valor === "object" && valor !== null) {
    return valor.nombre || valor.email || valor._id?.toString() || JSON.stringify(valor);
  }
  return String(valor);
};

const CambioCampoSimple = ({ campo, antes, despues, nombresPorId = {} }) => {
  const renderValor = (valor) => {
    if (valor === null || valor === undefined) {
      return <span className="text-slate-400">—</span>;
    }
    if (typeof valor === "object") {
      return <ResumenValorHistorial valor={valor} nombresPorId={nombresPorId} />;
    }
    return <span>{formatValorSimple(valor, nombresPorId)}</span>;
  };

  return (
    <div className="space-y-2 text-sm py-0.5">
      <div className="flex flex-wrap items-center gap-1">
        <span className="font-medium text-slate-700">
          {ETIQUETAS_CAMPO[campo] || campo}:
        </span>
        {typeof antes !== "object" && (
          <span className="text-slate-500 line-through">{formatValorSimple(antes, nombresPorId)}</span>
        )}
        <span className="text-slate-400 mx-1">→</span>
        {typeof despues !== "object" && (
          <span className="text-slate-800">{formatValorSimple(despues, nombresPorId)}</span>
        )}
      </div>
      {typeof antes === "object" && (
        <div className="mt-2">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Antes</div>
          {renderValor(antes)}
        </div>
      )}
      {typeof despues === "object" && (
        <div className="mt-2">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Después</div>
          {renderValor(despues)}
        </div>
      )}
    </div>
  );
};

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

const CambioRecursos = ({ antes, despues, nombresPorId = {} }) => {
  const renderLista = (lista, color) => {
    if (!Array.isArray(lista) || lista.length === 0)
      return <span className="text-slate-400 italic">sin recursos</span>;
    return (
      <ul className={`space-y-1 ${color}`}>
        {lista.map((r, i) => {
          const id =
            typeof r.recursoId === "object"
              ? r.recursoId?._id?.toString?.() || r.recursoId?.id?.toString?.() || r.recursoId?.nombre
              : r.recursoId;
          const nombre =
            r.recursoId?.nombre ||
            r.nombre ||
            nombresPorId[id] ||
            (typeof r.recursoId === "object" ? r.recursoId?.descripcion : null);

          return (
            <li key={id || i} className="text-xs flex items-start gap-1 break-words">
              <span className="font-bold shrink-0">•</span>
              <span className="flex-1">
                <span className="font-medium">{r.tipoRecurso || r.tipo || "Recurso"}</span>
                {nombre ? <span> — <span className="break-all">{nombre}</span></span> : null}
                {!nombre && id ? <span> — <span className="break-all">{id}</span></span> : null}
                {!nombre && !id ? <span> — recurso</span> : null} ×{r.cantidad}
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

const RenderCambios = ({ cambios, nombresPorId = {} }) => {
  if (!cambios || Object.keys(cambios).length === 0) return null;

  return (
    <div className="mt-2 border-t border-slate-200 pt-2 space-y-1">
      {Object.entries(cambios).map(([campo, valor]) => {
        if (campo === "horario") {
          return (
            <CambioHorario
              key={campo}
              antes={valor?.antes}
              despues={valor?.despues}
            />
          );
        }

        if (campo === "recursos" && (Array.isArray(valor?.antes) || Array.isArray(valor?.despues))) {
          return (
            <CambioRecursos
              key={campo}
              antes={valor?.antes}
              despues={valor?.despues}
              nombresPorId={nombresPorId}
            />
          );
        }

        if (valor !== null && typeof valor === "object" && "antes" in valor && "despues" in valor) {
          return (
            <CambioCampoSimple
              key={campo}
              campo={campo}
              antes={valor.antes}
              despues={valor.despues}
              nombresPorId={nombresPorId}
            />
          );
        }

        return (
          <div key={campo} className="text-sm py-0.5">
            <span className="font-medium text-slate-700">
              {ETIQUETAS_CAMPO[campo] || campo}:
            </span>{" "}
            <div className="mt-1 text-slate-700">
              <ResumenValorHistorial valor={valor} nombresPorId={nombresPorId} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

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

  const [mostrarFinalizar, setMostrarFinalizar] = useState(false);
  const [formFinalizacion, setFormFinalizacion] = useState({ recursos: [] });
  const [recursosFinalizacion, setRecursosFinalizacion] = useState([]);

  const tieneConflictos = conflictos.length > 0;

  // Reservas del pedido (para reflejar el consumo real tras finalizar, ver §3.4).
  const materialesReservados =
    pedido?.materialesReservados || pedido?.reserva?.materialesReservados || [];

  const consumoRealPorRecurso = (recId) => {
    if (!recId || pedido?.estado !== "Finalizado") return null;
    const entrada = materialesReservados.find((m) => {
      const mId = typeof m.itemId === "object" ? m.itemId?._id : m.itemId;
      return (mId || "").toString() === recId.toString();
    });
    if (!entrada || entrada.cantidadConsumidaReal == null) return null;
    const reservado = Number(entrada.cantidad ?? entrada.cantidadReservada ?? 0);
    const consumido = Number(entrada.cantidadConsumidaReal);
    return { reservado, consumido, devuelto: Math.max(0, reservado - consumido) };
  };

  const nombresPorId = (() => {
    const map = {};

    if (pedido?.laboratorio) {
      const idLaboratorio =
        typeof pedido.laboratorio === "object"
          ? pedido.laboratorio?._id?.toString?.() || pedido.laboratorio?.id?.toString?.()
          : pedido.laboratorio;
      if (idLaboratorio && typeof pedido.laboratorio === "object" && pedido.laboratorio.nombre) {
        map[idLaboratorio] = pedido.laboratorio.nombre;
      }
    }

    (pedido?.recursos || []).forEach((recurso) => {
      const recursoId =
        typeof recurso.recursoId === "object"
          ? recurso.recursoId?._id?.toString?.() || recurso.recursoId?.id?.toString?.()
          : recurso.recursoId;
      const nombreRecurso = recurso.recursoId?.nombre || recurso.nombre || nombresRecursos[recursoId];
      if (recursoId && nombreRecurso) {
        map[recursoId] = nombreRecurso;
      }
    });

    return map;
  })();

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const res = await api.get(`/pedido/${id}`);
        const dataPedido = res.data;
        setPedido(dataPedido);
        setConflictos(dataPedido.conflictos || []);

        // 1. Set para coleccionar IDs únicos (actuales e históricos)
        const idsPendientes = new Set();
        const tiposPorId = {}; // Para saber a qué endpoint pegarle

        // Agregar recursos actuales
        (dataPedido.recursos || []).forEach((r) => {
          const recId = typeof r.recursoId === "object" ? r.recursoId?._id : r.recursoId;
          if (recId) {
            idsPendientes.add(recId);
            tiposPorId[recId] = r.tipoRecurso?.toLowerCase() || r.tipo?.toLowerCase();
          }
        });

        // 2. Función recursiva para buscar IDs huérfanos en el historial
        const extraerIdsHistorial = (obj) => {
          if (!obj || typeof obj !== "object") return;

          // Buscar llaves comunes de IDs en tu estructura
          const posiblesLlaves = ["recursoId", "itemId", "equipoId"];
          posiblesLlaves.forEach(llave => {
            if (obj[llave]) {
              const strId = typeof obj[llave] === "object" ? obj[llave]._id : obj[llave];
              if (typeof strId === "string" && /^[a-f\d]{24}$/i.test(strId)) {
                idsPendientes.add(strId);
                // Si encontramos tipo en el objeto, lo guardamos para la consulta
                if (obj.tipo || obj.tipoRecurso) {
                  tiposPorId[strId] = (obj.tipo || obj.tipoRecurso).toLowerCase();
                }
              }
            }
          });

          // Seguir escaneando hijos
          Object.values(obj).forEach((val) => {
            if (typeof val === "object") extraerIdsHistorial(val);
          });
        };

        extraerIdsHistorial(dataPedido.historial);

        // 3. Obtener nombres faltantes
        if (idsPendientes.size > 0) {
          const nombresMap = {};

          await Promise.all(
            Array.from(idsPendientes).map(async (recId) => {
              // Si el pedido ya lo trajo populado desde el backend, lo usamos
              const recursoPopulado = dataPedido.recursos?.find(
                r => (r.recursoId?._id || r.recursoId) === recId
              );

              if (recursoPopulado?.recursoId?.nombre) {
                nombresMap[recId] = recursoPopulado.recursoId.nombre;
                return;
              }

              // Si no, lo buscamos en la API (Fallback para el historial)
              // Asumimos "item" por defecto si no encontramos el tipo en el escaneo
              const tipo = tiposPorId[recId] === "equipo" ? "equipo" : "items";
              try {
                const resRecurso = await api.get(`/${tipo}/${recId}`);
                if (resRecurso.data?.nombre) {
                  nombresMap[recId] = resRecurso.data.nombre;
                }
              } catch (error) {
                console.warn(`No se pudo obtener el nombre histórico para ID ${recId}:`, error.message);
              }
            })
          );
          setNombresRecursos(prev => ({ ...prev, ...nombresMap }));
        }
      } catch (err) {
        console.error("Error al obtener el pedido:", err);
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

  const ejecutarRechazo = async () => {
    if (!motivRechazo.trim()) {
      setErrorAccion("Debe proporcionar un motivo de rechazo.");
      return;
    }

    setErrorAccion("");
    try {
      // Magia pura: mandamos el motivo directamente en el estado
      const res = await api.patch(`/pedido/${id}/estado`, {
        estado: "Rechazado",
        motivoRechazo: motivRechazo
      });

      setPedido(res.data);
      setMostrarMotivRechazo(false);
      setMotivRechazo("");
    } catch (err) {
      console.error(err);
      setErrorAccion(err.response?.data?.error || "No se pudo rechazar el pedido.");
    }
  };

  const cancelarPedido = async () => {
    if (!window.confirm("¿Seguro que querés cancelar este pedido? Se liberarán las reservas.")) return;
    setErrorAccion("");
    try {
      const res = await api.patch(`/pedido/${id}/estado`, { estado: "Cancelado" });
      setPedido(res.data);
    } catch (err) {
      setErrorAccion(err.response?.data?.error || "Error al cancelar el pedido.");
    }
  };

  const ejecutarFinalizacion = async () => {
    setErrorAccion("");
    try {
      const descartes = formFinalizacion.recursos
        .filter((recurso) => recurso.registrarDescarte && recurso.tipo !== "Equipo")
        .map((recurso) => ({
          tipo: recurso.tipoDetalle?.toLowerCase() === "reactivo" ? "reactivo" : "material",
          itemId: recurso.recursoId,
          cantidad: Number(recurso.cantidadDescartada || 0),
          motivo: recurso.motivo || "Finalización de pedido",
        }));

      const desperfectos = formFinalizacion.recursos
        .filter((recurso) => recurso.registrarDefecto && recurso.tipo === "Equipo")
        .map((recurso) => ({
          equipoId: recurso.recursoId,
          motivo: recurso.motivoDefecto || "Desperfecto informado al finalizar el pedido",
        }));

      const consumos = formFinalizacion.recursos
        .filter((recurso) => recurso.esConsumible && recurso.tipo !== "Equipo" && recurso.registrarConsumo)
        .map((recurso) => ({
          itemId: recurso.recursoId,
          cantidadConsumida: Math.max(0, Number(recurso.cantidadConsumida ?? recurso.cantidadSolicitada)),
        }));

      const payload = { consumos, descartes, desperfectos };
      const res = await api.patch(`/pedido/${id}/finalizar`, payload);
      setPedido(res.data.pedido || res.data);
      setMostrarFinalizar(false);
      setFormFinalizacion({ recursos: [] });
    } catch (err) {
      const status = err.response?.status;
      const mensajePorStatus = {
        403: "No tenés permisos para finalizar pedidos.",
        404: "El pedido ya no existe.",
      };
      const fallback =
        status === 400
          ? "Datos de finalización inválidos. Revisá las cantidades o el estado del pedido."
          : mensajePorStatus[status] || "Error al finalizar el pedido.";
      setErrorAccion(err.response?.data?.error || fallback);
    }
  };

  const actualizarRecursoFinalizacion = (recursoId, cambios) => {
    setFormFinalizacion((prev) => ({
      ...prev,
      recursos: prev.recursos.map((recurso) =>
        recurso.recursoId === recursoId ? { ...recurso, ...cambios } : recurso
      ),
    }));
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

  const toggleEstadoTarea = async (index) => {
    if (!pedido || !pedido.checklist) return;

    setErrorAccion("");
    const nuevaChecklist = [...pedido.checklist];
    const estadoActual = nuevaChecklist[index].estado;
    const nuevoEstado = estadoActual === "Completada" ? "Pendiente" : "Completada";

    nuevaChecklist[index] = { ...nuevaChecklist[index], estado: nuevoEstado };

    try {
      // Intentamos actualizarlo en el backend (ajustá el endpoint según tu backend)
      const res = await api.patch(`/pedido/${id}/checklist`, { checklist: nuevaChecklist });
      setPedido(res.data);
    } catch (err) {
      console.error(err);
      setErrorAccion("No se pudo actualizar el estado de la tarea.");
    }
  };

  useEffect(() => {
    if (!pedido?.recursos?.length) return;
    const recursos = pedido.recursos
      .filter((r) => r?.recursoId)
      .map((r) => {
        const recursoId = typeof r.recursoId === "object" ? r.recursoId?._id : r.recursoId;
        const tipoBase = r.tipoRecurso || r.tipo || "Item";
        const esEquipo = tipoBase === "Equipo";
        const item = typeof r.recursoId === "object" ? r.recursoId : null;
        return {
          id: recursoId,
          recursoId,
          nombre: r.recursoId?.nombre || r.nombre || nombresRecursos[recursoId] || "Recurso",
          tipo: esEquipo ? "Equipo" : "Item",
          tipoDetalle: r.recursoId?.tipo || r.tipoDetalle || (esEquipo ? "Equipo" : "Material"),
          cantidadSolicitada: Number(r.cantidad || 1),
          esConsumible: esEquipo ? false : (item?.esConsumible ?? true),
        };
      });

    setRecursosFinalizacion(recursos);
    setFormFinalizacion((prev) => ({
      ...prev,
      recursos: recursos.map((recurso) => {
        const existente = prev.recursos?.find((entry) => entry.recursoId === recurso.recursoId);
        return {
          ...existente,
          ...recurso,
          registrarDescarte: existente?.registrarDescarte || false,
          cantidadDescartada: existente?.cantidadDescartada ?? recurso.cantidadSolicitada,
          motivo: existente?.motivo || "",
          registrarDefecto: existente?.registrarDefecto || false,
          motivoDefecto: existente?.motivoDefecto || "",
          registrarConsumo: existente?.registrarConsumo || false,
          cantidadConsumida: existente?.cantidadConsumida ?? recurso.cantidadSolicitada,
        };
      }),
    }));
  }, [pedido, nombresRecursos]);

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
        <div className="relative">
          <div className="absolute bottom-0 left-0 w-full h-40 bg-emerald-100 opacity-20 rounded-[2rem]" />
          <div className="relative z-10 bg-white border border-slate-100 rounded-[2rem] shadow-lg p-6 sm:p-8">
            <div className="absolute -top-5 left-10 right-10 h-6 rounded-t-[2rem] bg-stone-700 rounded-sm" />
            {/* HEADER */}
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
                <p className="text-slate-700">{formatFechaHora(pedido.fechaHora || pedido.fecha)}</p>
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
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${pedido.estado === "Aprobado" || pedido.estado === "Aceptado"
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
              <h2 className="font-semibold text-lg text-emerald-700 mb-4">🛠️ Materiales solicitado</h2>
              <div className="space-y-2">
                {pedido.recursos?.map((r, i) => {
                  const recId = typeof r.recursoId === "object" ? r.recursoId?._id : r.recursoId;
                  const nombreRecurso =
                    r.recursoId?.nombre ||
                    r.recurso?.nombre ||
                    nombresRecursos[recId] ||
                    r.nombre ||
                    "Recurso";
                  const consumo = consumoRealPorRecurso(recId);
                  return (
                    <div
                      key={recId || i}
                      className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700">{nombreRecurso}</p>
                        <p className="text-xs text-slate-400 mt-1">{r.tipo || r.tipoRecurso || "—"}</p>
                        {consumo && (
                          <p className="text-xs text-slate-500 mt-1">
                            Consumido: {consumo.consumido} / Reservado: {consumo.reservado}
                            {consumo.devuelto > 0 && (
                              <span className="text-emerald-600 font-medium"> · Devuelto: {consumo.devuelto}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                        x{r.cantidad}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ALERTAS DE CONFLICTOS */}
            {!tieneConflictos ? (
              <div className="mb-8 border border-emerald-300 bg-emerald-50 rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-emerald-700">✅ Pedido satisfacible</p>
                <p className="text-sm text-emerald-600 mt-1">El laboratorio, materiales y equipos se encuentran disponibles.</p>
              </div>
            ) : (
              <div className="mb-8 border border-red-300 bg-red-50 rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-red-700">⚠️ Pedido con conflictos</p>
                <p className="text-sm text-red-600 mt-1">Existen problemas que impiden satisfacer este pedido.</p>
              </div>
            )}

            {/* DETALLE CONFLICTOS */}
            {tieneConflictos && (
              <div className="mb-8">
                <h2 className="font-semibold text-sm text-red-600 mb-3">Conflictos detectados</h2>
                <div className="space-y-2">
                  {conflictos.map((c, i) => (
                    <div key={i} className="border border-red-300 bg-red-50 rounded-lg p-3">
                      <p className="text-sm text-red-700">{c.mensaje}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHECKLIST */}
            <div className="mb-8">
              <h2 className="font-semibold text-lg text-emerald-700 mb-4">✓ Checklist de seguimiento</h2>
              {pedido.checklist?.length > 0 ? (
                <div className="space-y-3">
                  {pedido.checklist.map((tarea, index) => (
                    <div
                      key={tarea._id || index}
                      className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={tarea.estado === "Completada"}
                          onChange={() => toggleEstadoTarea(index)}
                          className="h-4 w-4 accent-emerald-600 cursor-pointer"
                        />
                        <div>
                          <p className={`text-sm font-medium ${tarea.estado === "Completada" ? "text-slate-500 line-through" : "text-slate-700"}`}>
                            {tarea.descripcion}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Tipo: {tarea.tipo}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${tarea.estado === "Completada"
                          ? "bg-green-100 text-green-700"
                          : tarea.estado === "En Proceso"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-slate-200 text-slate-700"
                        }`}>
                        {tarea.estado}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <p className="text-sm text-slate-500">No hay tareas generadas para este pedido.</p>
                </div>
              )}
            </div>

            {/* HISTORIAL */}
            <div className="mb-8">
              <button
                onClick={() => setHistorialExpandido(!historialExpandido)}
                className="flex items-center gap-2 w-full text-left mb-4 p-3 hover:bg-emerald-50 rounded-lg transition"
              >
                <span className="font-semibold text-lg text-emerald-700">📋 Historial de actividad</span>
                <span className={`text-emerald-600 transition-transform ml-auto text-xl ${historialExpandido ? "rotate-180" : ""}`}>▼</span>
              </button>

              {historialExpandido && (
                Array.isArray(pedido.historial) && pedido.historial.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-200" />
                    <div className="space-y-4">
                      {[...pedido.historial]
                        .sort((a, b) => {
                          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                          return dateB - dateA;
                        })
                        .map((evento, index) => (
                          <div key={evento._id || index} className="pl-16 relative">
                            <div className="absolute left-1.5 top-2 w-10 h-10 bg-white border-4 border-emerald-400 rounded-full flex items-center justify-center shadow-md">
                              <div className="w-4 h-4 bg-emerald-400 rounded-full" />
                            </div>

                            <div className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-all">
                              <div className="flex items-start justify-between mb-2 gap-2">
                                <div className="flex items-center gap-2 flex-wrap flex-1">
                                  {evento.accion && (
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${ACCION_ESTILO[evento.accion] || "bg-slate-100 text-slate-600"}`}>
                                      {evento.accion}
                                    </span>
                                  )}
                                  <p className="font-semibold text-slate-800 break-words">{evento.descripcion}</p>
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                  {evento.createdAt ? new Date(evento.createdAt).toLocaleString() : "—"}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 mb-3 font-medium">
                                👤 {evento.usuario?.nombre} {evento.usuario?.apellido}
                                {evento.usuario?.rol && <span className="text-emerald-600 ml-1">· {evento.usuario.rol}</span>}
                              </p>

                              {evento.cambios && Object.keys(evento.cambios).length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <RenderCambios cambios={evento.cambios} nombresPorId={nombresPorId} />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 text-center">
                    <p className="text-sm text-slate-500">No hay actividad registrada.</p>
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
                      className={`border rounded-xl p-4 hover:shadow-md transition-all ${esMotivRechazo
                          ? "border-red-300 bg-gradient-to-br from-red-50 to-orange-50"
                          : "border-slate-200 bg-gradient-to-br from-white to-slate-50"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${esMotivRechazo
                              ? "bg-red-200 text-red-700"
                              : comentario.usuario?.rol === "ADMIN"
                                ? "bg-purple-100 text-purple-700"
                                : comentario.usuario?.rol === "PERSONAL"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}>
                            {esMotivRechazo ? "⚠️ RECHAZO" : comentario.usuario?.rol}
                          </span>
                          <span className={`font-semibold ${esMotivRechazo ? "text-red-700" : "text-slate-800"}`}>
                            {comentario.usuario?.nombre} {comentario.usuario?.apellido}
                          </span>
                        </div>
                        <span className={`text-xs ${esMotivRechazo ? "text-red-400" : "text-slate-400"}`}>
                          {new Date(comentario.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed font-medium ${esMotivRechazo ? "text-red-700" : "text-slate-700"}`}>{comentario.mensaje}</p>
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

            {/* MOTIVO DE RECHAZO */}
            {pedido.estado === "Rechazado" && pedido.motivoRechazo && (
              <div className="mb-8 border border-red-300 bg-red-50 rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-red-700">❌ Pedido Rechazado</p>
                <p className="text-sm text-red-600 mt-1"><strong>Motivo:</strong> {pedido.motivoRechazo}</p>
              </div>
            )}

            {/* PANEL DE ACCIONES (Pendientes y Aceptados) */}
            {["Pendiente", "Aceptado"].includes(pedido.estado) && (
              <div className="border-t border-slate-200 pt-6 flex flex-col gap-3">
                {errorAccion && (
                  <div className="p-4 bg-red-50 border border-red-300 text-red-600 text-sm rounded-xl flex justify-between items-start">
                    <span><strong>⚠️ Error:</strong> {errorAccion}</span>
                    <button onClick={() => setErrorAccion("")} className="ml-4 text-red-400 hover:text-red-600 font-bold text-lg">✕</button>
                  </div>
                )}

                {/* INLINE FORM: RECHAZO */}
                {mostrarMotivRechazo && (
                  <div className="border border-red-300 bg-red-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-red-700">¿Por qué está rechazando este pedido?</p>
                    <textarea
                      value={motivRechazo}
                      onChange={(e) => setMotivRechazo(e.target.value)}
                      rows={2}
                      placeholder="Escribí el motivo..."
                      className="w-full border border-red-300 rounded-lg p-3 text-sm resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={ejecutarRechazo} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold">Confirmar Rechazo</button>
                      <button onClick={() => setMostrarMotivRechazo(false)} className="flex-1 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold">Cancelar</button>
                    </div>
                  </div>
                )}

                {/* INLINE FORM: FINALIZACIÓN */}
                {mostrarFinalizar && (
                  <div className="border border-blue-300 bg-blue-50 rounded-xl p-4 space-y-4">
                    <p className="text-sm font-semibold text-blue-800">Finalizar pedido: reportá consumo real, descartes y desperfectos</p>
                    <p className="text-xs text-blue-700">Los reutilizables y lo no consumido de cada consumible vuelven al stock automáticamente.</p>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-blue-700">Recursos solicitados</p>
                      <div className="space-y-3">
                        {recursosFinalizacion.map((recurso) => {
                          const recursoForm = formFinalizacion.recursos.find((entry) => entry.recursoId === recurso.recursoId) || recurso;
                          const esEquipo = recurso.tipo === "Equipo";
                          const esConsumible = !esEquipo && (recurso.esConsumible ?? true);

                          return (
                            <div key={recurso.recursoId} className="rounded-lg border border-blue-200 bg-white p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">{recurso.nombre}</p>
                                  <p className="text-xs text-slate-500">Solicitado: {recurso.cantidadSolicitada} · {recurso.tipoDetalle}</p>
                                </div>
                                <span className="text-xs font-medium text-blue-700">{esEquipo ? "Equipo" : "Inventario"}</span>
                              </div>

                              {!esEquipo && (
                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={!!recursoForm.registrarDescarte}
                                    onChange={(e) => actualizarRecursoFinalizacion(recurso.recursoId, { registrarDescarte: e.target.checked, cantidadDescartada: e.target.checked ? recurso.cantidadSolicitada : 0 })}
                                  />
                                  Registrar descarte
                                </label>
                              )}

                              {esEquipo ? (
                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={!!recursoForm.registrarDefecto}
                                    onChange={(e) => actualizarRecursoFinalizacion(recurso.recursoId, { registrarDefecto: e.target.checked, motivoDefecto: e.target.checked ? recursoForm.motivoDefecto || "" : "" })}
                                  />
                                  Marcar como desperfecto
                                </label>
                              ) : recursoForm.registrarDescarte ? (
                                <>
                                  <input
                                    type="number"
                                    min="1"
                                    max={recurso.cantidadSolicitada}
                                    value={recursoForm.cantidadDescartada === undefined ? "" : recursoForm.cantidadDescartada}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      actualizarRecursoFinalizacion(recurso.recursoId, {
                                        cantidadDescartada: val === "" ? "" : Number(val)
                                      });
                                    }}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="Cantidad descartada"
                                  />
                                  <input
                                    type="text"
                                    value={recursoForm.motivo || ""}
                                    onChange={(e) => actualizarRecursoFinalizacion(recurso.recursoId, { motivo: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="Motivo"
                                  />
                                </>
                              ) : null}

                              {esEquipo && recursoForm.registrarDefecto ? (
                                <input
                                  type="text"
                                  value={recursoForm.motivoDefecto || ""}
                                  onChange={(e) => actualizarRecursoFinalizacion(recurso.recursoId, { motivoDefecto: e.target.value })}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                  placeholder="Motivo del desperfecto"
                                />
                              ) : null}

                              {esConsumible && (
                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={!!recursoForm.registrarConsumo}
                                    onChange={(e) => actualizarRecursoFinalizacion(recurso.recursoId, {
                                      registrarConsumo: e.target.checked,
                                      cantidadConsumida: recurso.cantidadSolicitada,
                                    })}
                                  />
                                  Reportar consumo real
                                </label>
                              )}

                              {esConsumible && recursoForm.registrarConsumo ? (
                                <>
                                  <input
                                    type="number"
                                    min="0"
                                    max={recurso.cantidadSolicitada}
                                    value={recursoForm.cantidadConsumida ?? 0}
                                    onChange={(e) => actualizarRecursoFinalizacion(recurso.recursoId, { cantidadConsumida: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    placeholder={`Consumido de ${recurso.cantidadSolicitada}`}
                                  />
                                  <p className="text-xs text-slate-500">
                                    Lo no consumido vuelve al stock. Omitir el reporte cuenta como consumido al 100 %.
                                  </p>
                                </>
                              ) : null}

                              {!esEquipo && !esConsumible && (
                                <p className="text-xs text-slate-500 italic">🔁 Reutilizable — vuelve al stock al finalizar.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={ejecutarFinalizacion} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">Confirmar Finalización</button>
                      <button onClick={() => setMostrarFinalizar(false)} className="flex-1 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold">Volver</button>
                    </div>
                  </div>
                )}

                {/* BOTONES PRIMARIOS */}
                {!mostrarMotivRechazo && !mostrarFinalizar && (
                  <div className="flex flex-wrap gap-3">

                    {pedido.estado === "Pendiente" && (
                      <>
                        <button
                          onClick={aprobar}
                          disabled={tieneConflictos}
                          className={`flex-1 px-4 py-2.5 text-white rounded-lg font-semibold shadow-md ${tieneConflictos ? "bg-gray-400 cursor-not-allowed opacity-60" : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                        >
                          ✅ Aprobar
                        </button>
                        <button onClick={() => setMostrarMotivRechazo(true)} className="flex-1 px-4 py-2.5 border-2 border-red-400 text-red-600 hover:bg-red-50 rounded-lg font-semibold">
                          ❌ Rechazar
                        </button>
                      </>
                    )}

                    {pedido.estado === "Aceptado" && (
                      <button onClick={() => setMostrarFinalizar(true)} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md">
                        🏁 Finalizar Pedido
                      </button>
                    )}

                    {/* El botón Cancelar siempre aparece si está Pendiente o Aceptado */}
                    <button onClick={cancelarPedido} className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg font-semibold transition-colors">
                      🚫 Cancelar
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