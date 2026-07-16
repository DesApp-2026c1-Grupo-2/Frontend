import {
  FiTool,
  FiArrowRight,
  FiAlertTriangle,
  FiBarChart2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function DashboardEquipamiento({
  periodo,
  setPeriodo,
  equipmentUsage,
  stockAlerts,
  formatRangoPeriodo,
  estadisticas,
  loadingUso,
  loadingMat,
}) {
  const navigate = useNavigate();

  const PERIODOS = [
    { value: "dia", label: "Día" },
    { value: "semana", label: "Semana" },
    { value: "mes", label: "Mes" },
  ];

  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}

     <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-5 sm:px-6 py-5 border-b border-slate-100">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <FiTool
              size={22}
              className="text-emerald-700"
            />
          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Equipamiento
            </h2>

            <p className="text-sm text-slate-500">
              Uso de equipos y estado del stock.
            </p>

          </div>

        </div>

        <button
          onClick={() => navigate("/equipamiento")}
          className="
            self-start lg:self-auto
            flex items-center gap-2
            text-sm font-medium
            text-emerald-700
            hover:text-emerald-800
            transition
          "
        >
          Ver equipamiento

          <FiArrowRight />
        </button>

      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 p-6">

        {/* ================= USO ================= */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 relative">

          {loadingUso && (
            <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">

            <div>

              <div className="flex items-center gap-2">

                <FiBarChart2 className="text-emerald-700" />

                <h3 className="font-semibold text-slate-800">
                  Uso de equipos
                </h3>

              </div>

              {formatRangoPeriodo(
                estadisticas.desde,
                estadisticas.hasta
              ) && (
                <p className="text-xs text-slate-500 mt-1">
                  {formatRangoPeriodo(
                    estadisticas.desde,
                    estadisticas.hasta
                  )}
                </p>
              )}

            </div>

            <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-white p-1">

              {PERIODOS.map((op) => (

                <button
                  key={op.value}
                  onClick={() => setPeriodo(op.value)}
                  className={`
                    px-2 sm:px-3 py-1 text-xs rounded-lg transition
                    ${
                      periodo === op.value
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }
                  `}
                >
                  {op.label}
                </button>

              ))}

            </div>

          </div>

          <div className="space-y-3">

            {equipmentUsage.length > 0 ? (

              equipmentUsage.map((item, index) => (

                <div
                  key={item.equipoId || index}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-white border border-slate-200 p-3"
                >

                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                    {index + 1}
                  </div>

                  <div className="flex-1">

                    <p className="font-medium text-slate-800">
                      {item.nombre}
                    </p>

                    <p className="text-xs self-start sm:self-auto text-slate-500">
                      {[item.codigo, item.tipo]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                  </div>

                  <span className="text-xs bg-emerald-50 text-emerald-700 rounded-lg px-3 py-1 font-semibold">
                    {item.usos} usos
                  </span>

                </div>

              ))

            ) : (

              !loadingUso && (
                <p className="text-sm text-slate-500">
                  No hay registros.
                </p>
              )

            )}

          </div>

        </div>

        {/* ================= STOCK ================= */}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 relative">

          {loadingMat && (
            <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-5">

            <FiAlertTriangle className="text-amber-600" />

            <h3 className="font-semibold text-slate-800">
              Alerta de stock
            </h3>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {stockAlerts.length} materiales
            </span>

          </div>

          <div className="space-y-3 max-h-72 lg:max-h-80 overflow-y-auto">

            {stockAlerts.length > 0 ? (

              stockAlerts.map((item) => (

                <div
                  key={item._id || item.id}
                  className="rounded-xl border border-amber-200 bg-white p-3"
                >

                  <p className="font-medium text-slate-800">
                    {item.nombre}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Código {item.codigo}
                  </p>

                  <p className="text-sm text-amber-700 mt-2 font-semibold">
                    {item.stockDisponible ?? item.stock ?? 0} {item.unidad}
                  </p>

                </div>

              ))

            ) : (

              !loadingMat && (
                <p className="text-sm text-slate-500">
                  No hay materiales con bajo stock.
                </p>
              )

            )}

          </div>

        </div>

      </div>

    </div>
  );
}