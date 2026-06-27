export default function FormularioEdificio({
  formData,
  errores,
  handleChange,
  handleSubmit,
  cerrarModal,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

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
          placeholder="Edificio Central"
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white text-slate-800
            focus:outline-none transition
            ${
              errores?.nombre
                ? "border border-red-400 focus:border-red-500"
                : "border border-slate-200 focus:border-emerald-300"
            }
          `}
        />

        {errores?.nombre && (
          <p className="text-red-500 text-xs mt-1">
            {errores.nombre}
          </p>
        )}
      </div>

      {/* DIRECCION */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Dirección
        </label>

        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Av. Siempre Viva 123"
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white text-slate-800
            focus:outline-none transition
            ${
              errores?.direccion
                ? "border border-red-400 focus:border-red-500"
                : "border border-slate-200 focus:border-emerald-300"
            }
          `}
        />

        {errores?.direccion && (
          <p className="text-red-500 text-xs mt-1">
            {errores.direccion}
          </p>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3 pt-2">

        <button
          type="button"
          onClick={cerrarModal}
          className="
            px-4 py-2 rounded-xl text-sm
            border border-slate-200
            text-slate-600 bg-white
            hover:bg-slate-50 hover:border-slate-300
            transition
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="px-6 py-2 rounded-xl text-sm bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200"
        >
          Guardar
        </button>

      </div>

    </form>
  );
}