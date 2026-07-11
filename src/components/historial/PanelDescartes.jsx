import { useEffect, useState } from "react";
import { getDescartes } from "../../services/descartes";
import { discardCategories, tipoToCategoria, formatDate } from "../../utils/inventarioMapper";
import Paginador from "../common/Paginador";

const LIMIT = 20;

// Categoría del frontend → valor `tipo` del backend.
const categoriaAtipo = {
  Equipos: "equipo",
  Materiales: "material",
  Reactivos: "reactivo",
};

// Nombre/código y responsable del registro poblado del backend.
function refDescarte(d) {
  return d.itemId && typeof d.itemId === "object"
    ? d.itemId
    : d.equipoId && typeof d.equipoId === "object"
      ? d.equipoId
      : {};
}

function responsableDescarte(d) {
  const u = d.usuarioId;
  if (u && typeof u === "object") {
    return `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() || "Sin responsable";
  }
  return "Sistema";
}

function DescarteCard({ descarte }) {
  const ref = refDescarte(descarte);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{ref.nombre || "—"}</p>
          <p className="mt-1 text-xs text-slate-500">Código {ref.codigo || "—"}</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {tipoToCategoria[descarte.tipo] || descarte.tipo}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cantidad</span>
          <span className="mt-1 block font-semibold text-slate-900">{descarte.cantidad}</span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Fecha</span>
          <span className="mt-1 block font-semibold text-slate-900">{formatDate(descarte.createdAt)}</span>
        </div>
      </div>
      <div className="mt-3">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Responsable</span>
        <span className="mt-1 block text-sm font-semibold text-slate-900">{responsableDescarte(descarte)}</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{descarte.motivo || "Sin motivo registrado"}</p>
    </div>
  );
}

function PanelDescartes() {
  const [descartes, setDescartes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoria, setCategoria] = useState("Todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const totalPaginas = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDescartes({
          tipo: categoriaAtipo[categoria],
          desde: fechaDesde ? `${fechaDesde}T00:00:00Z` : undefined,
          hasta: fechaHasta ? `${fechaHasta}T23:59:59Z` : undefined,
          page,
          limit: LIMIT,
        });
        if (cancelado) return;
        setDescartes(data.descartes || []);
        setTotal(data.total || 0);
      } catch (err) {
        if (cancelado) return;
        const detalle = err.response?.data?.detalles?.[0]?.message || err.response?.data?.error;
        setError(detalle || "No se pudieron cargar los descartes");
        setDescartes([]);
        setTotal(0);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [categoria, fechaDesde, fechaHasta, page]);

  // Al cambiar un filtro, volver a la primera página.
  const cambiarCategoria = (c) => {
    setCategoria(c);
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
  const limpiarFiltros = () => {
    setCategoria("Todos");
    setFechaDesde("");
    setFechaHasta("");
    setPage(1);
  };

  const irAPagina = (p) => {
    if (p < 1 || p > totalPaginas || p === page || loading) return;
    setPage(p);
  };

  const hayFiltros = categoria !== "Todos" || fechaDesde || fechaHasta;

  return (
    <div>
      {/* Filtros */}
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Filtra por categoría o rango de fechas para consultar los descartes.
          </p>
          <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-600">
            {total} {total === 1 ? "descarte" : "descartes"}
          </span>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {discardCategories.map((c) => {
            const isActive = categoria === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => cambiarCategoria(c)}
                className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:justify-start ${
                  isActive
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-rose-600"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col">
            <label className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => cambiarDesde(e.target.value)}
              max={fechaHasta || undefined}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:w-48"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => cambiarHasta(e.target.value)}
              min={fechaDesde || undefined}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:w-48"
            />
          </div>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 cursor-pointer"
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
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-rose-500"></div>
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
              {descartes.length > 0 ? (
                descartes.map((d) => <DescarteCard key={d.id || d._id} descarte={d} />)
              ) : (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm leading-6 text-slate-500">
                  No hay descartes registrados para la consulta actual.
                </p>
              )}
            </div>

            {/* Tabla escritorio */}
            <div className="hidden overflow-hidden rounded-[22px] border border-slate-200 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Fecha</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Tipo</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Nombre</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Codigo</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Cantidad</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Motivo</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {descartes.length > 0 ? (
                      descartes.map((d) => {
                        const ref = refDescarte(d);
                        return (
                          <tr key={d.id || d._id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-rose-50/40 transition-colors">
                            <td className="px-4 py-3 text-slate-500">{formatDate(d.createdAt)}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {tipoToCategoria[d.tipo] || d.tipo}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{ref.nombre || "—"}</td>
                            <td className="px-4 py-3 text-slate-500">{ref.codigo || "—"}</td>
                            <td className="px-4 py-3 text-slate-500">{d.cantidad}</td>
                            <td className="px-4 py-3 text-slate-500">{d.motivo || "Sin motivo registrado"}</td>
                            <td className="px-4 py-3 text-slate-500">{responsableDescarte(d)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-sm text-slate-500">
                          No hay descartes registrados para la consulta actual.
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

export default PanelDescartes;
