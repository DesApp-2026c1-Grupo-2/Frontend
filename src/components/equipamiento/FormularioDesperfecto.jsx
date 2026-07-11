export default function FormularioDesperfecto({
  desperfectoItem,
  desperfectoForm = {},
  handleChange,
  handleSubmit,
  errores = {},
  enviando = false,
}) {
  const descripcion = desperfectoForm.descripcion || "";
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
          Descripcion
        </label>
        <textarea
          name="descripcion"
          value={descripcion}
          onChange={handleChange}
          placeholder="Escribir detalle del desperfecto..."
          rows="4"
          required
          maxLength={500}
          className={`${inputClass("descripcion")} resize-none`}
        />
        <div className="mt-1 flex items-center justify-between">
          {errores.descripcion ? (
            <p className="text-red-500 text-xs">{errores.descripcion}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-slate-400">{descripcion.length}/500</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={enviando}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enviando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
