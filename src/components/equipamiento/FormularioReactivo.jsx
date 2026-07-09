export default function FormularioReactivo({
  formData,
  handleChange,
  handleSubmit,
  statusOptions = ["Disponible", "Reservado", "En uso", "Descartado"],
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
          Nombre del reactivo
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre || ""}
          onChange={handleChange}
          placeholder="Ej. Ácido clorhídrico (HCl)"
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
            placeholder="ml, g, mol/L"
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
      </div>

      {/* ─── Datos adicionales (opcional, pendiente de confirmar en backend) ─── */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Información adicional (opcional)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Concentración
            </label>
            <input
              type="text"
              name="concentracion"
              value={formData.concentracion || ""}
              onChange={handleChange}
              placeholder="Ej. 37%, 1M"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Vencimiento
            </label>
            <input
              type="date"
              name="vencimiento"
              value={formData.vencimiento || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Lote
            </label>
            <input
              type="text"
              name="lote"
              value={formData.lote || ""}
              onChange={handleChange}
              placeholder="Nº de lote del proveedor"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Peligrosidad
            </label>
            <select
              name="peligrosidad"
              value={formData.peligrosidad || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            >
              <option value="">Sin especificar</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
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