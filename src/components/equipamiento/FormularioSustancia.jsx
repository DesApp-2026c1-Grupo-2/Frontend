export default function FormularioSustancia({
  formData,
  handleChange,
  handleSubmit,
  statusOptions = ["Disponible", "Descartado"],
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
          Nombre de la sustancia
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre || ""}
          onChange={handleChange}
          placeholder="Ej. Cloruro de sodio (NaCl)"
          className={inputClass("nombre")}
        />
        {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Cantidad
          </label>
          <input
            type="number"
            name="cantidad"
            min="1"
            value={formData.cantidad || ""}
            onChange={handleChange}
            className={inputClass("cantidad")}
          />
          {errores.cantidad && <p className="text-red-500 text-xs mt-1">{errores.cantidad}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Unidad
          </label>
          <input
            type="text"
            name="unidad"
            value={formData.unidad || ""}
            onChange={handleChange}
            placeholder="g, kg, ml"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Ubicación
        </label>
        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion || ""}
          onChange={handleChange}
          placeholder="Ej. Lab 1 / Edif. A"
          className={inputClass("ubicacion")}
        />
        {errores.ubicacion && <p className="text-red-500 text-xs mt-1">{errores.ubicacion}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Estado
        </label>
        <select
          name="estado"
          value={formData.estado || "Disponible"}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {formData.estado === "Descartado" && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Descartar genera una <strong>baja de stock</strong>: el lote deja de estar disponible.
          </p>
        )}
      </div>

      {/* ─── Datos adicionales (opcional, pendiente de confirmar en backend) ─── */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Información adicional (opcional)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Pureza
            </label>
            <input
              type="text"
              name="pureza"
              value={formData.pureza || ""}
              onChange={handleChange}
              placeholder="Ej. 99.5%"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Fórmula
            </label>
            <input
              type="text"
              name="formula"
              value={formData.formula || ""}
              onChange={handleChange}
              placeholder="Ej. NaCl"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Clasificación
            </label>
            <input
              type="text"
              name="clasificacion"
              value={formData.clasificacion || ""}
              onChange={handleChange}
              placeholder="Ej. Sal inorgánica"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>
        </div>
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