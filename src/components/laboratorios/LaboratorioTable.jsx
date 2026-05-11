export default function LaboratorioTable({ laboratorios }) {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b">
            {["ID", "NOMBRE", "CAPACIDAD", "TIPO", "ESTADO"].map((col) => (
              <th key={col} className="text-left px-5 py-3 text-xs font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {laboratorios.map((lab, i) => (
            <tr
              key={lab.id}
              className={`border-b hover:bg-emerald-50/40 ${
                i % 2 ? "bg-slate-50/30" : ""
              }`}
            >
              <td className="px-5 py-4 font-mono text-xs">
                {lab.id?.slice(-6)}
              </td>

              <td className="px-5 py-4 font-medium">
                {lab.nombre}
              </td>

              <td className="px-5 py-4">{lab.capacidad}</td>

              <td className="px-5 py-4">{lab.tipo}</td>

              <td className="px-5 py-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    lab.estado === "disponible"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {lab.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}