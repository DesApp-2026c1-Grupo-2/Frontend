import { FiClipboard, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function DashboardPedidos({
  totalPedidos,
  pedidosAprobados,
}) {
  const navigate = useNavigate();

  const porcentaje =
    totalPedidos > 0
      ? Math.round((pedidosAprobados / totalPedidos) * 100)
      : 0;

  return (
    <div className="h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <FiClipboard
              size={22}
              className="text-emerald-700"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Pedidos
            </h2>

            <p className="text-sm text-slate-500">
              Estado general de las solicitudes.
            </p>
          </div>

        </div>

        <button
          onClick={() => navigate("/pedidos")}
          className="
            flex items-center gap-2
            text-sm
            font-medium
            text-emerald-700
            hover:text-emerald-800
            transition
          "
        >
          Ver pedidos

          <FiArrowRight />
        </button>

      </div>

      <div className="grid grid-cols-2 gap-4 p-5">

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">

          <p className="text-sm text-slate-500">
            Total de pedidos
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {totalPedidos}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Históricos registrados.
          </p>

        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">

          <p className="text-sm text-emerald-700">
            Pedidos aprobados
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-800">
            {pedidosAprobados}
          </p>

          <p className="mt-2 text-sm text-emerald-700">
            {porcentaje}% del total.
          </p>

        </div>

      </div>

    </div>
  );
}