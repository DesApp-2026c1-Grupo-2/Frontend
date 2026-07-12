import { useEffect, useState } from "react";
import { getMovimientos } from "../../services/movimientos";
import { obtenerEdificios } from "../../services/edificioService";
import { obtenerLaboratoriosPorEdificio } from "../../services/laboratorioService";
import { tipoMovimientoLabel, tiposMovimiento, formatDate } from "../../utils/inventarioMapper";
import Paginador from "../common/Paginador";

const LIMIT = 20;

// Item poblado del registro (puede venir como objeto o como ObjectId string).
function itemRef(m) {
  return m.itemId && typeof m.itemId === "object" ? m.itemId : {};
}

// Responsable del movimiento; `usuarioId` puede venir null (movimientos de
// sistema, p. ej. el cron de consumo).
function responsableMovimiento(m) {
  const u = m.usuarioId;
  if (u && typeof u === "object") {
    return `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() || "Sin responsable";
  }
  return "Sistema";
}

// Laboratorio(s) del movimiento. Origen y/o destino pueden venir null; en una
// transferencia vienen ambos y se muestran como "origen → destino".
function laboratorioMovimiento(m) {
  const nombre = (x) => (x && typeof x === "object" ? x.nombre : null);
  const origen = nombre(m.origenLaboratorioId);
  const destino = nombre(m.destinoLaboratorioId);
  if (origen && destino) return `${origen} → ${destino}`;
  return origen || destino || "—";
}

// Cantidad con signo explícito (los negativos ya traen "-").
function formatCantidad(n) {
  if (typeof n !== "number") return "—";
  return n > 0 ? `+${n}` : `${n}`;
}

// Color según el signo: egreso rojo, ingreso verde, neutro gris.
function cantidadClass(n) {
  if (typeof n !== "number" || n === 0) return "text-slate-500";
  return n < 0 ? "text-rose-600" : "text-emerald-600";
}

function MovimientoCard({ movimiento: m }) {
  const ref = itemRef(m);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{ref.nombre || "—"}</p>
          <p className="mt-1 text-xs text-slate-500">Código {ref.codigo || "—"}</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {tipoMovimientoLabel[m.tipoMovimiento] || m.tipoMovimiento}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cantidad</span>
          <span className={`mt-1 block font-semibold ${cantidadClass(m.cantidad)}`}>{formatCantidad(m.cantidad)}</span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Stock</span>
          <span className="mt-1 block font-semibold text-slate-900">
            {m.cantidadAnterior} → {m.cantidadNueva}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Fecha</span>
          <span className="mt-1 block font-semibold text-slate-900">{formatDate(m.createdAt)}</span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Laboratorio</span>
          <span className="mt-1 block font-semibold text-slate-900">{laboratorioMovimiento(m)}</span>
        </div>
      </div>
      <div className="mt-3">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Responsable</span>
        <span className="mt-1 block text-sm font-semibold text-slate-900">{responsableMovimiento(m)}</span>
      </div>
      {m.observacion && <p className="mt-3 text-sm text-slate-500">{m.observacion}</p>}
    </div>
  );
}

function PanelMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tipoMov, setTipoMov] = useState("Todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Cascada Edificio → Laboratorio para obtener un laboratorioId real.
  const [edificios, setEdificios] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [edificioId, setEdificioId] = useState("");
  const [laboratorioId, setLaboratorioId] = useState("");

  const totalPaginas = Math.max(1, Math.ceil(total / LIMIT));

  // Cargar edificios una sola vez.
  useEffect(() => {
    let cancelado = false;
    obtenerEdificios()
      .then((data) => {
        if (!cancelado) setEdificios(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error al cargar edificios:", err));
    return () => {
      cancelado = true;
    };
  }, []);

  // Cargar laboratorios del edificio seleccionado (la lista se vacía en los
  // handlers cuando no hay edificio, para no llamar setState dentro del effect).
  useEffect(() => {
    if (!edificioId) return;
    let cancelado = false;
    obtenerLaboratoriosPorEdificio(edificioId)
      .then((data) => {
        if (!cancelado) setLaboratorios(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error al cargar laboratorios:", err));
    return () => {
      cancelado = true;
    };
  }, [edificioId]);

  // Cargar movimientos según filtros y página.
  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovimientos({
          tipoMovimiento: tipoMov === "Todos" ? undefined : tipoMov,
          laboratorioId: laboratorioId || undefined,
          desde: fechaDesde ? `${fechaDesde}T00:00:00Z` : undefined,
          hasta: fechaHasta ? `${fechaHasta}T23:59:59Z` : undefined,
          page,
          limit: LIMIT,
        });
        if (cancelado) return;
        setMovimientos(data.movimientos || []);
        setTotal(data.total || 0);
      } catch (err) {
        if (cancelado) return;
        const detalle = err.response?.data?.detalles?.[0]?.message || err.response?.data?.error;
        setError(detalle || "No se pudieron cargar los movimientos");
        setMovimientos([]);
        setTotal(0);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [tipoMov, fechaDesde, fechaHasta, laboratorioId, page]);

  // Al cambiar un filtro, volver a la primera página.
  const cambiarTipo = (t) => {
    setTipoMov(t);
    setPage(1);
  };
  const cambiarDesde = (v) => {
    setFechaDesde(v);
    setPage(1);
  };
  const cambiarHasta = (v) => {
    setFechaHasta(v);
    setPage(1);
  };
  const cambiarEdificio = (v) => {
    setEdificioId(v);
    setLaboratorioId("");
    if (!v) setLaboratorios([]);
    setPage(1);
  };
  const cambiarLaboratorio = (v) => {
    setLaboratorioId(v);
    setPage(1);
  };
  const limpiarFiltros = () => {
    setTipoMov("Todos");
    setFechaDesde("");
    setFechaHasta("");
    setEdificioId("");
    setLaboratorioId("");
    setLaboratorios([]);
    setPage(1);
  };

  const irAPagina = (p) => {
    if (p < 1 || p > totalPaginas || p === page || loading) return;
    setPage(p);
  };

  const hayFiltros = tipoMov !== "Todos" || fechaDesde || fechaHasta || edificioId || laboratorioId;

  return (
    <div>
      {/* Filtros */}
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Filtra por tipo de movimiento, laboratorio o rango de fechas.
          </p>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
            {total} {total === 1 ? "movimiento" : "movimientos"}
          </span>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {tiposMovimiento.map((t) => {
            const isActive = tipoMov === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => cambiarTipo(t)}
                className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:justify-start ${
                  isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                }`}
              >
                {t === "Todos" ? "Todos" : tipoMovimientoLabel[t]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col">
            <label className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Edificio</label>
            <select
              value={edificioId}
              onChange={(e) => cambiarEdificio(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 sm:w-48"
            >
              <option value="">Todos</option>
              {edificios.map((ed) => {
                const id = ed.id || ed._id;
                return (
                  <option key={id} value={id}>
                    {ed.nombre}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Laboratorio</label>
            <select
              value={laboratorioId}
              onChange={(e) => cambiarLaboratorio(e.target.value)}
              disabled={!edificioId}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 sm:w-48"
            >
              <option value="">Todos</option>
              {laboratorios.map((lab) => {
                const id = lab.id || lab._id;
                return (
                  <option key={id} value={id}>
                    {lab.nombre}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => cambiarDesde(e.target.value)}
              max={fechaHasta || undefined}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 sm:w-48"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => cambiarHasta(e.target.value)}
              min={fechaDesde || undefined}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 sm:w-48"
            />
          </div>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
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
              {movimientos.length > 0 ? (
                movimientos.map((m) => <MovimientoCard key={m.id || m._id} movimiento={m} />)
              ) : (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm leading-6 text-slate-500">
                  No hay movimientos registrados para la consulta actual.
                </p>
              )}
            </div>

            {/* Tabla escritorio */}
            <div className="hidden overflow-hidden rounded-[22px] border border-slate-200 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Fecha</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Tipo</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Item</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Cantidad</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Stock</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Laboratorio</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Responsable</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.length > 0 ? (
                      movimientos.map((m) => {
                        const ref = itemRef(m);
                        return (
                          <tr key={m.id || m._id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-emerald-50/40 transition-colors">
                            <td className="px-4 py-3 text-slate-500">{formatDate(m.createdAt)}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {tipoMovimientoLabel[m.tipoMovimiento] || m.tipoMovimiento}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-slate-900">{ref.nombre || "—"}</span>
                              <span className="block text-xs text-slate-400">{ref.codigo || "—"}</span>
                            </td>
                            <td className={`px-4 py-3 font-semibold ${cantidadClass(m.cantidad)}`}>{formatCantidad(m.cantidad)}</td>
                            <td className="px-4 py-3 text-slate-500">{m.cantidadAnterior} → {m.cantidadNueva}</td>
                            <td className="px-4 py-3 text-slate-500">{laboratorioMovimiento(m)}</td>
                            <td className="px-4 py-3 text-slate-500">{responsableMovimiento(m)}</td>
                            <td className="px-4 py-3 text-slate-500">{m.observacion || "—"}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-sm text-slate-500">
                          No hay movimientos registrados para la consulta actual.
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

export default PanelMovimientos;
