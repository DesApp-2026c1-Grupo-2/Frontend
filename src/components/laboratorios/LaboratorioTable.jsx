import React, { useState } from "react";

export default function LaboratorioTable({
  laboratorios,
  equipos,
  onEditar,
}) {
  const [labExpandido, setLabExpandido] = useState(null);

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
              
              <React.Fragment key={lab.id}>
              <tr
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
                <td className="px-5 py-4 text-sm">
                  {(() => {

                    const equiposLab = equipos.filter(
                      (eq) => eq.laboratorioId?.id === lab.id
                    );

                    if (equiposLab.length === 0) {
                      return (
                        <span className="text-slate-400">
                          No
                        </span>
                      );
                    }

                    return (
                      <button
                        onClick={() =>
                          setLabExpandido(
                            labExpandido === lab.id ? null : lab.id
                          )
                        }
                        className="
                          px-3 py-1 rounded-lg
                          bg-slate-100
                          hover:bg-emerald-100
                          text-slate-700
                          hover:text-emerald-700
                          transition
                          text-xs font-medium
                        "
                      >
                        Ver equipos ({equiposLab.length})
                      </button>
                    );
                  })()}
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
              {labExpandido === lab.id && (
                <tr>
                  <td
                    colSpan={7}
                    className="bg-slate-50 px-6 py-5"
                  >

                    <div className="flex flex-wrap gap-4">

                      {equipos
                        .filter(
                          (eq) => eq.laboratorioId?.id === lab.id
                        )
                        .map((eq) => (
                          <div
                            key={eq.id}
                            className="
                              min-w-[220px]
                              rounded-2xl
                              border border-slate-200
                              bg-white
                              p-4
                              shadow-sm
                            "
                          >

                            <h4 className="font-semibold text-slate-800">
                              {eq.nombre}
                            </h4>

                            <p className="text-sm text-slate-500 mt-1">
                              {eq.tipo}
                            </p>

                            <span
                              className={`
                                inline-block mt-3
                                px-2 py-1
                                rounded-lg text-xs font-medium
                                ${
                                  eq.estado === "disponible"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : eq.estado === "mantenimiento"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                                }
                              `}
                            >
                              {eq.estado}
                            </span>
                          </div>
                        ))}
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}