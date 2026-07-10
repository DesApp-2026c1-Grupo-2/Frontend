export default function FormularioDesperfecto({
  desperfectoItem,
  desperfectoForm = {},
  handleChange,
  handleSubmit,
  errores = {},
}) {
  const inputClass = (campo) =>
    `w-full px-3 py-2 rounded-lg border bg-white text-slate-800 focus:outline-none focus:ring-2 transition ${
      errores[campo]
        ? "border-red-400 focus:ring-red-100 focus:border-red-400"
        : "border-slate-200 focus:ring-emerald-200 focus:border-emerald-300"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-3 py-3">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Equipo
        </label>
        <input
          type="text"
          readOnly
          value={desperfectoItem ? `[ ${desperfectoItem.tipo} ]` : ""}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-not-allowed outline-none select-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Reserva asociada
        </label>
        <select
          name="reservaId"
          value={desperfectoForm.reservaId || ""}
          onChange={handleChange}
          className={inputClass("reservaId")}
        >
          <option value="">Seleccionar reserva</option>
          <option value="res-1">Reserva #4012 - Laboratorio A</option>
          <option value="res-2">Reserva #4592 - Clase practica de Fisica</option>
        </select>
        {errores.reservaId && <p className="text-red-500 text-xs mt-1">{errores.reservaId}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Fecha
        </label>
        <input
          type="date"
          name="fecha"
          value={desperfectoForm.fecha || ""}
          onChange={handleChange}
          required
          className={inputClass("fecha")}
        />
        {errores.fecha && <p className="text-red-500 text-xs mt-1">{errores.fecha}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Descripcion
        </label>
        <textarea
          name="descripcion"
          value={desperfectoForm.descripcion || ""}
          onChange={handleChange}
          placeholder="Escribir detalle del desperfecto..."
          rows="4"
          required
          className={`${inputClass("descripcion")} resize-none`}
        />
        {errores.descripcion && (
          <p className="text-red-500 text-xs mt-1">{errores.descripcion}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
