export default function BarraFiltros({
  edificio,
  setEdificio,
  laboratorio,
  setLaboratorio,
  edificios,
  laboratorios,
  vistaActual,
}) {

  const opcionesLaboratorios =
    vistaActual === "timeGridWeek"
      ? laboratorios
      : [{ _id: "todos", nombre: "todos" }, ...laboratorios];

  console.log("Opciones laboratorios:", opcionesLaboratorios);
  
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
            <option
              key={ed.id || ed._id}
              value={ed.id || ed._id}
            >
              {ed.nombre}
            </option>
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
          {opcionesLaboratorios.map((lab) => (
            <option
              key={lab.id || lab._id}
              value={lab.id || lab._id}
            >
              {lab.nombre}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}