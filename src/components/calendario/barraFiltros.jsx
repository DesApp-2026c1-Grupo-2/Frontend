export default function BarraFiltros({
  edificio,
  setEdificio,
  laboratorio,
  setLaboratorio,
  edificios,
  laboratorios,
  vistaActual,
  permitirTodosEnSemana = false,
}) {

  // En mes/día siempre se ofrece "todos". En la vista semanal solo se ofrece
  // cuando `permitirTodosEnSemana` está activo (caso DOCENTE, para ver sus
  // reservas en todos los laboratorios).
  const incluirTodos =
    vistaActual !== "timeGridWeek" || permitirTodosEnSemana;

  const opcionesLaboratorios = incluirTodos
    ? [{ _id: "todos", nombre: "todos" }, ...laboratorios]
    : laboratorios;

  console.log("Opciones laboratorios:", opcionesLaboratorios);
  
  return (
    <div className="flex flex-col sm:flex-row gap-3">

      <div>
        <label className="block text-xs text-slate-500 mb-1">
          Edificio
        </label>

        <select
          value={edificio}
          onChange={(e) => {
            setEdificio(e.target.value);
            setLaboratorio("todos");
          }}
          className="
            w-full sm:min-w-[180px]
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
            w-full sm:min-w-[180px]
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