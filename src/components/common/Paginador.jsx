import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Paginador presentacional: el estado (page) vive en el componente padre; este
// solo notifica la página destino vía onPageChange. No renderiza nada si hay una
// sola página. Extraído del patrón de PanelDescartes.
function Paginador({ page, totalPaginas, onPageChange, loading = false }) {
  if (totalPaginas <= 1) return null;

  const irAPagina = (p) => {
    if (p < 1 || p > totalPaginas || p === page || loading) return;
    onPageChange(p);
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => irAPagina(page - 1)}
        disabled={page <= 1 || loading}
        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
      >
        <FiChevronLeft /> Anterior
      </button>
      <span className="text-sm text-slate-500">
        Página {page} de {totalPaginas}
      </span>
      <button
        type="button"
        onClick={() => irAPagina(page + 1)}
        disabled={page >= totalPaginas || loading}
        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
      >
        Siguiente <FiChevronRight />
      </button>
    </div>
  );
}

export default Paginador;
