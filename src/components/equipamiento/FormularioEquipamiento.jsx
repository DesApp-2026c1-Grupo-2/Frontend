export default function FormularioEquipamiento({
  formData,
  handleChange,
  handleSubmit,
  cerrarModal,
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

      {/* NOMBRE */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Nombre
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej. Micropipeta digital"
          className={inputClass("nombre")}
        />
        {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
      </div>

      {/* CANTIDAD + UNIDAD */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Cantidad
          </label>
          <input
            type="number"
            name="cantidad"
            min="1"
            value={formData.cantidad}
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
            value={formData.unidad}
            onChange={handleChange}
            placeholder="unidad, ml, g"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          />
        </div>
      </div>

      {/* UBICACION */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Ubicación
        </label>
        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
          placeholder="Ej. Lab 1 / Edif. A"
          className={inputClass("ubicacion")}
        />
        {errores.ubicacion && <p className="text-red-500 text-xs mt-1">{errores.ubicacion}</p>}
      </div>

      {/* MOVILIDAD */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Movilidad
        </label>
        <select
          name="movilidad"
          value={formData.movilidad || "Fija"}
          onChange={handleChange}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
        >
          <option value="Fija">Fija</option>
          <option value="Movible">Movible</option>
        </select>
      </div>

      {/* ESTADO */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Estado
        </label>
        <select
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={cerrarModal}
          className="px-3 py-2 rounded-lg text-sm border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition"
        >
          Cancelar
        </button>

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
