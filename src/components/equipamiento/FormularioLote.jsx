// Formulario de edición a nivel de LOTE: los datos propios de cada lote
// físico — cantidad y estado. El nombre/código del ítem se editan en
// FormularioItem. La ubicación se cambia solo por transferencia (POST /lotes/:id/transferir).
export default function FormularioLote({
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
          Cantidad
        </label>
        <input
          type="number"
          name="cantidad"
          min="1"
          value={formData.cantidad ?? ""}
          onChange={handleChange}
          placeholder="Ej. 10"
          className={inputClass("cantidad")}
        />
        {errores.cantidad && <p className="text-red-500 text-xs mt-1">{errores.cantidad}</p>}
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
