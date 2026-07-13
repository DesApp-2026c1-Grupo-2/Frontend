// Formulario de edición a nivel de ÍTEM (no de lote): datos generales del
// insumo compartidos por todos sus lotes — nombre, código, cantidad y unidad.
// El estado se edita por lote en FormularioLote; la ubicación, por transferencia.
export default function FormularioItem({
  formData,
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
          Nombre
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

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Código
        </label>
        <input
          type="text"
          name="codigo"
          value={formData.codigo || ""}
          onChange={handleChange}
          placeholder="Ej. RC-001"
          className={inputClass("codigo")}
        />
        {errores.codigo && <p className="text-red-500 text-xs mt-1">{errores.codigo}</p>}
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
            placeholder="unidad, caja, ml"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          />
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
