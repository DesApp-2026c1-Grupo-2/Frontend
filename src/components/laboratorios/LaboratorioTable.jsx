export default function LaboratorioTable({
  laboratorios,
  onEditar,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                "ID",
                "LABORATORIO",
                "CAPACIDAD",
                "TIPO",
                "ESTADO",
                "EQUIPOS FIJOS",
                "ACCIONES",
              ].map((col) => (
                <th
                  key={col}
                  className="text-left text-xs font-semibold text-slate-500 tracking-wider px-5 py-3"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {laboratorios.map((lab, i) => (
              <tr
                key={lab.id}
                className={`border-b border-slate-100 last:border-none hover:bg-emerald-50/50 transition-colors ${
                  i % 2 === 1 ? "bg-slate-50/30" : ""
                }`}
              >
                {/* ID */}
                <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                  {lab.id?.slice(-6)}
                </td>

                {/* NOMBRE */}
                <td className="px-5 py-4 text-slate-800 font-medium">
                  {lab.nombre}
                </td>

                {/* CAPACIDAD */}
                <td className="px-5 py-4 text-slate-600">
                  {lab.capacidad}
                </td>

                {/* TIPO */}
                <td className="px-5 py-4 text-slate-600 capitalize">
                  {lab.tipo}
                </td>

                {/* ESTADO */}
                <td className="px-5 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      lab.estado === "disponible"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : lab.estado === "mantenimiento"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {lab.estado}
                  </span>
                </td>

                {/* EQUIPOS */}
                <td className="px-5 py-4 text-slate-600 text-sm">
                  {lab.tieneEquipos ? "Sí" : "No"}
                </td>

                {/* ACCIONES */}
                <td className="px-5 py-4">
                  <button
                    onClick={() => onEditar(lab)}
                    className="
                      px-3 py-1.5
                      rounded-lg
                      text-xs
                      border border-slate-200
                      bg-white
                      text-slate-600
                      hover:border-emerald-300
                      hover:text-emerald-700
                      transition-colors
                      shadow-sm
                    "
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}