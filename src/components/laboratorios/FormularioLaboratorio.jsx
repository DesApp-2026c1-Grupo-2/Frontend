export default function FormularioLaboratorio({
  formData,
  handleChange,
  handleSubmit,
  cerrarModal,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* NOMBRE (solo lectura) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Nombre del laboratorio
        </label>

        <input
          name="nombre"
          value={formData.nombre}
          disabled
          className="
            w-full
            rounded-xl
            border border-slate-200
            bg-slate-100
            px-4 py-2.5
            text-sm text-slate-500
          "
        />
      </div>

      {/* CAPACIDAD (solo lectura) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Capacidad
        </label>

        <input
          name="capacidad"
          value={formData.capacidad}
          disabled
          className="
            w-full
            rounded-xl
            border border-slate-200
            bg-slate-100
            px-4 py-2.5
            text-sm text-slate-500
          "
        />
      </div>

      {/* TIPO (solo lectura) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tipo de laboratorio
        </label>

        <input
          name="tipo"
          value={formData.tipo}
          disabled
          className="
            w-full
            rounded-xl
            border border-slate-200
            bg-slate-100
            px-4 py-2.5
            text-sm text-slate-500
          "
        />
      </div>

      {/* ESTADO (EDITABLE - ÚNICO CAMPO DEL SPRINT) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Estado
        </label>

        <select
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          className="
            w-full
            rounded-xl
            border border-slate-200
            bg-white
            px-4 py-2.5
            text-sm text-slate-700
            outline-none
            transition-colors
            focus:border-emerald-300
            focus:ring-4
            focus:ring-emerald-100
          "
        >
          <option value="disponible">Disponible</option>
          <option value="reservado">Reservado</option>
          <option value="en mantenimiento">En mantenimiento</option>
          <option value="fuera de servicio">Fuera de servicio</option>
        </select>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={cerrarModal}
          className="
            px-4 py-2
            rounded-xl
            text-sm
            text-slate-600
            bg-white
            border border-slate-300
            hover:bg-slate-50
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="
            px-4 py-2
            rounded-xl
            text-sm
            bg-emerald-500
            text-white
            font-semibold
            hover:bg-emerald-600
          "
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}