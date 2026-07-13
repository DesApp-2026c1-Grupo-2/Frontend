import { useEffect, useMemo, useState } from "react";
import { getMantenimientos, getAllEquipos } from "../../services/equipamiento";
import { tipoMantenimientoLabel, tiposMantenimiento, formatDate } from "../../utils/inventarioMapper";
import Paginador from "../common/Paginador";
import SelectBuscable from "../common/SelectBuscable";

const LIMIT = 20;

// Responsable del mantenimiento; `responsableId` puede venir poblado (objeto) o
// null (registrado sin usuario asociado).
function responsableMantenimiento(r) {
  const u = r.responsableId;
  if (u && typeof u === "object") {
    return `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() || "Sin responsable";
  }
  return "Sin responsable";
}

// Badge de tipo con color propio (preventivo verde, correctivo ámbar).
function TipoBadge({ tipo }) {
  const clase =
    tipo === "correctivo"
      ? "bg-amber-100 text-amber-700"
      : tipo === "preventivo"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${clase}`}>
      {tipoMantenimientoLabel[tipo] || tipo}
    </span>
  );
}

function MantenimientoCard({ mantenimiento: m }) {
  const enCurso = !m.fin;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <TipoBadge tipo={m.tipo} />
        {enCurso && (
          <span className="shrink-0 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
            En curso
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Inicio</span>
          <span className="mt-1 block font-semibold text-slate-900">{formatDate(m.fecha)}</span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Fin</span>
          <span className="mt-1 block font-semibold text-slate-900">{enCurso ? "En curso" : formatDate(m.fin)}</span>
        </div>
      </div>
      <div className="mt-3">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Responsable</span>
        <span className="mt-1 block text-sm font-semibold text-slate-900">{responsableMantenimiento(m)}</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{m.descripcion || "Sin descripción"}</p>
    </div>
  );
}

function PanelMantenimiento() {
  const [registros, setRegistros] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [equipos, setEquipos] = useState([]);
  const [equipoId, setEquipoId] = useState("");
  const [tipoMant, setTipoMant] = useState("Todos");

  // Cargar la lista de equipos una sola vez (para el selector).
  useEffect(() => {
    let cancelado = false;
    getAllEquipos()
      .then((data) => {
        if (!cancelado) setEquipos(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error al cargar equipos:", err));
    return () => {
      cancelado = true;
    };
  }, []);

  // Cargar el historial del equipo seleccionado. Sin equipo no se llama al
  // backend (se muestra el mensaje guía).
  useEffect(() => {
    if (!equipoId) return;
    let cancelado = false;
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMantenimientos(equipoId, {
          tipo: tipoMant === "Todos" ? undefined : tipoMant,
          page,
          limit: LIMIT,
        });
        if (cancelado) return;
        const reg = data.registros || [];
        const tot = data.paginacion?.total || 0;
        setRegistros(reg);
        setTotal(tot);
        setTotalPaginas(data.paginacion?.totalPaginas || Math.max(1, Math.ceil(tot / LIMIT)));
      } catch (err) {
        if (cancelado) return;
        const detalle = err.response?.data?.detalles?.[0]?.message || err.response?.data?.error;
        setError(detalle || "No se pudo cargar el historial de mantenimiento");
        setRegistros([]);
        setTotal(0);
        setTotalPaginas(1);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [equipoId, tipoMant, page]);

  // Al cambiar un filtro, volver a la primera página.
  const cambiarEquipo = (v) => {
    setEquipoId(v);
    setPage(1);
  };
  const cambiarTipo = (t) => {
    setTipoMant(t);
    setPage(1);
  };
  const limpiarFiltros = () => {
    setTipoMant("Todos");
    setPage(1);
  };

  const irAPagina = (p) => {
    if (p < 1 || p > totalPaginas || p === page || loading) return;
    setPage(p);
  };

  const hayFiltros = tipoMant !== "Todos";

  // Opciones del selector de equipo (label = nombre · código).
  const equipoOptions = useMemo(
    () =>
      equipos.map((eq) => {
        const id = eq.id || eq._id;
        return { value: id, label: `${eq.nombre} · ${eq.codigo}` };
      }),
    [equipos]
  );

  return (
    <div>
      {/* Filtros */}
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Elegí un equipo para consultar su historial de mantenimiento.
          </p>
          {equipoId && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-600">
              {total} {total === 1 ? "mantenimiento" : "mantenimientos"}
            </span>
          )}
        </div>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex w-full flex-col sm:w-auto">
            <label className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Equipo</label>
            <SelectBuscable
              value={equipoId}
              onChange={cambiarEquipo}
              options={equipoOptions}
              placeholder="Seleccioná un equipo…"
              buscarPlaceholder="Buscar por nombre o código…"
            />
          </div>
        </div>

        {equipoId && (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
              {tiposMantenimiento.map((t) => {
                const isActive = tipoMant === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => cambiarTipo(t)}
                    className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:justify-start ${
                      isActive
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:text-amber-600"
                    }`}
                  >
                    {t === "Todos" ? "Todos" : tipoMantenimientoLabel[t]}
                  </button>
                );
              })}
            </div>
            {hayFiltros && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-amber-300 hover:text-amber-600 cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {!equipoId ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm leading-6 text-slate-500">
            Seleccioná un equipo para ver su historial de mantenimiento.
          </p>
        ) : loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
              <p className="text-sm text-slate-500">Cargando historial...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        ) : (
          <>
            {/* Vista móvil */}
            <div className="space-y-3 md:hidden">
              {registros.length > 0 ? (
                registros.map((m) => <MantenimientoCard key={m.id || m._id} mantenimiento={m} />)
              ) : (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm leading-6 text-slate-500">
                  Este equipo no tiene mantenimientos registrados.
                </p>
              )}
            </div>

            {/* Tabla escritorio */}
            <div className="hidden overflow-hidden rounded-[22px] border border-slate-200 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Inicio</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Fin</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Tipo</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Descripción</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.length > 0 ? (
                      registros.map((m) => {
                        const enCurso = !m.fin;
                        return (
                          <tr key={m.id || m._id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-amber-50/40 transition-colors">
                            <td className="px-4 py-3 text-slate-500">{formatDate(m.fecha)}</td>
                            <td className="px-4 py-3">
                              {enCurso ? (
                                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">En curso</span>
                              ) : (
                                <span className="text-slate-500">{formatDate(m.fin)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3"><TipoBadge tipo={m.tipo} /></td>
                            <td className="px-4 py-3 text-slate-500">{m.descripcion || "—"}</td>
                            <td className="px-4 py-3 text-slate-500">{responsableMantenimiento(m)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
                          Este equipo no tiene mantenimientos registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginador */}
            <Paginador
              page={page}
              totalPaginas={totalPaginas}
              onPageChange={irAPagina}
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default PanelMantenimiento;
