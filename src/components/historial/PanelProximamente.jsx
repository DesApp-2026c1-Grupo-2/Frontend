import { FiClock } from "react-icons/fi";

// Placeholder para las pestañas de historial aún no implementadas
// (Movimientos de stock y Mantenimiento de equipos).
function PanelProximamente({ titulo, descripcion }) {
  return (
    <div className="px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
          <FiClock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">{titulo}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {descripcion || "Esta sección estará disponible próximamente."}
        </p>
        <span className="mt-4 inline-flex rounded-full bg-slate-200/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Próximamente
        </span>
      </div>
    </div>
  );
}

export default PanelProximamente;
