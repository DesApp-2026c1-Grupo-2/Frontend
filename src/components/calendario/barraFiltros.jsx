export default function BarraFiltros({
  edificio,
  setEdificio,
  laboratorio,
  setLaboratorio,
}) {
  const edificios = [
    "HC",
    "MA",
    "MB",
    "SM",
  ];

  const laboratoriosPorEdificio = {
    HC: [
      "Todos",
      "Laboratorio 1",
      "Laboratorio 2",
      "Laboratorio 3",
    ],
    MA: [
      "Todos",
      "Laboratorio 1",
      "Laboratorio 2",
    ],
    MB: [
      "Todos",
      "Laboratorio 1",
      "Laboratorio 2",
      "Laboratorio 3",
    ],
    SM: [
      "Todos",
      "Laboratorio 1",
    ],
  };

  return (
    <div className="flex items-center gap-4">

      <div>
        <label className="block text-xs text-slate-500 mb-1">
          Edificio
        </label>

        <select
          value={edificio}
          onChange={(e) => {
            setEdificio(e.target.value);
            setLaboratorio("Todos");
          }}
          className="
            min-w-[180px]
            pl-4
            pr-10
            py-2
            rounded-xl
            text-sm
            font-medium
            text-left
            border border-emerald-200
            text-emerald-700
            bg-white
            hover:bg-emerald-50
            transition
            shadow-sm
        "
        >
          {edificios.map((ed) => (
            <option key={ed}>{ed}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">
          Laboratorio
        </label>

        <select
          value={laboratorio}
          onChange={(e) => setLaboratorio(e.target.value)}
          className="
            min-w-[180px]
            pl-4
            pr-10
            py-2
            rounded-xl
            text-sm
            font-medium
            text-left
            border border-emerald-200
            text-emerald-700
            bg-white
            hover:bg-emerald-50
            transition
            shadow-sm
          "
        >
          {laboratoriosPorEdificio[edificio].map((lab) => (
            <option key={lab}>{lab}</option>
          ))}
        </select>
      </div>

    </div>
  );
}