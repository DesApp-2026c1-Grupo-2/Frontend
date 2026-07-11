// Formulario para registrar una ENTRADA de stock (restock): crea un lote nuevo
// sobre un ítem ya existente. Un ingreso siempre entra como "disponible", por
// eso el estado no se pide acá (se cambia luego por lote si hace falta).
export default function FormularioAgregarLote({
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
          Cantidad que ingresa
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
          Ubicación
        </label>
        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion || ""}
          onChange={handleChange}
          placeholder="Ej. Depósito A - Estante 3"
          className={inputClass("ubicacion")}
        />
        {errores.ubicacion && <p className="text-red-500 text-xs mt-1">{errores.ubicacion}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Fecha de vencimiento (opcional)
        </label>
        <input
          type="date"
          name="fechaVencimiento"
          value={formData.fechaVencimiento || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition"
        >
          Registrar entrada
        </button>
      </div>
    </form>
  );
}
