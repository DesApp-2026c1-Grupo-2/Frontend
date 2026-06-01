export default function FormularioEquipo({
  formData,
  handleChange,
  handleSubmit,
  cerrarModal,
}) {
  // Verificamos si el equipo es fijo. Esto ayuda a manejar la regla condicional del laboratorioId.
  // Dependiendo de cómo manejes el state, el valor podría ser el booleano literal o un string.
  const isFijo = formData.esFijo === true || String(formData.esFijo) === "true";

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
          value={formData.nombre || ""}
          onChange={handleChange}
          placeholder="Ej. Microscopio Binocular"
          required
          minLength={2}
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
        />
      </div>

      {/* CÓDIGO Y TIPO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Código
          </label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo || ""}
            onChange={handleChange}
            placeholder="Ej. EQ-LAB-001"
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Tipo
          </label>
          <input
            type="text"
            name="tipo"
            value={formData.tipo || ""}
            onChange={handleChange}
            placeholder="Ej. Medición, Refrigeración..."
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          />
        </div>
      </div>

      {/* MOVILIDAD (ES FIJO) Y ESTADO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Movilidad
          </label>
          <select
            name="esFijo"
            value={formData.esFijo !== undefined ? formData.esFijo : ""}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          >
            <option value="" disabled>Seleccione...</option>
            <option value={true}>Equipo Fijo</option>
            <option value={false}>Equipo Móvil</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado || "disponible"}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          >
            <option value="disponible">Disponible</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera de servicio">Fuera de Servicio</option>
          </select>
        </div>
      </div>

      {/* EDIFICIO Y LABORATORIO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Edificio (ID)
          </label>
          {/* NOTA: Idealmente esto sería un <select> si tienes los datos de los edificios */}
          <input
            type="text"
            name="edificioId"
            value={formData.edificioId || ""}
            onChange={handleChange}
            placeholder="Ingrese el ObjectId válido"
            required
            minLength={24}
            maxLength={24}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          />
        </div>

        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${!isFijo ? 'text-slate-400' : 'text-slate-500'}`}>
            Laboratorio (ID)
          </label>
          {/* Si no es fijo, el campo se deshabilita para cumplir con el esquema Joi */}
          <input
            type="text"
            name="laboratorioId"
            value={formData.laboratorioId || ""}
            onChange={handleChange}
            placeholder={!isFijo ? "No aplica a equipos móviles" : "Ingrese el ObjectId válido"}
            required={isFijo}
            disabled={!isFijo}
            minLength={24}
            maxLength={24}
            className={`w-full px-3 py-2 rounded-lg border transition ${
              !isFijo
                ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                : "border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            }`}
          />
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3 pt-4">
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