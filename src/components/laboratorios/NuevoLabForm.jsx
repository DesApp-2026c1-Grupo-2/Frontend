export default function NuevoLaboratorioForm({
  formData,
  handleChange,
  handleSubmit,
  cerrarModal,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* NOMBRE */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Nombre del laboratorio
        </label>

        <input
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Laboratorio 202"
          className="
            w-full
            rounded-xl
            border border-slate-200
            bg-white
            px-4 py-2.5
            text-sm text-slate-700
            placeholder:text-slate-400
            outline-none
            transition-colors
            focus:border-emerald-300
            focus:ring-4
            focus:ring-emerald-100
          "
          required
        />
      </div>

      {/* CAPACIDAD */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Capacidad
        </label>

        <input
          name="capacidad"
          type="number"
          value={formData.capacidad}
          onChange={handleChange}
          placeholder="Ej: 30"
          className="
            w-full
            rounded-xl
            border border-slate-200
            bg-white
            px-4 py-2.5
            text-sm text-slate-700
            placeholder:text-slate-400
            outline-none
            transition-colors
            focus:border-emerald-300
            focus:ring-4
            focus:ring-emerald-100
          "
          required
        />
      </div>

      {/* TIPO */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tipo de laboratorio
        </label>

        <select
          name="tipo"
          value={formData.tipo}
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
          required
        >
          <option value="">Seleccionar tipo</option>
          <option value="biologia">Biología</option>
          <option value="quimica">Química</option>
          <option value="mixto">Mixto</option>
        </select>
      </div>

      {/* INFO */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p className="text-xs text-slate-500">
          El laboratorio será creado automáticamente con estado
          <span className="font-medium text-emerald-600">
            {" "}disponible
          </span>.
        </p>
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
            hover:border-slate-400
            hover:bg-slate-50
            transition-colors
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
            shadow-sm
            transition-colors
          "
        >
          Crear laboratorio
        </button>
      </div>
    </form>
  );
}