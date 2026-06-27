export default function FormularioEquipo({
  formData,
  handleChange,
  handleSubmit,
  cerrarModal,
  errores = {},
}) {
  const isFijo = formData.esFijo === true || String(formData.esFijo) === "true";

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
          Nombre del Equipo
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre || ""}
          onChange={handleChange}
          placeholder="Ej. Espectrómetro de masas"
          className={inputClass("nombre")}
        />
        {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
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
            placeholder="Ej. EQ-001"
            className={inputClass("codigo")}
          />
          {errores.codigo && <p className="text-red-500 text-xs mt-1">{errores.codigo}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Tipo de Equipo
          </label>
          <input
            type="text"
            name="tipo"
            value={formData.tipo || ""}
            onChange={handleChange}
            placeholder="Ej. Analítico, Medición, Soporte"
            className={inputClass("tipo")}
          />
          {errores.tipo && <p className="text-red-500 text-xs mt-1">{errores.tipo}</p>}
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
            value={String(formData.esFijo)}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
          >
            <option value="false">Movible</option>
            <option value="true">Fija (Asignado a un espacio)</option>
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
            <option value="reservado">Reservado</option>
            <option value="en_uso">En uso</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera_de_servicio">Fuera de servicio</option>
            <option value="descartado">Descartado</option>
          </select>
        </div>
      </div>

      {/* UBICACIÓN CONDICIONAL (EDIFICIO Y LABORATORIO) */}
      {isFijo && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all duration-300">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              ID Edificio
            </label>
            <input
              type="text"
              name="edificioId"
              value={formData.edificioId || ""}
              onChange={handleChange}
              placeholder="ID o nombre del edificio"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              ID Laboratorio
            </label>
            <input
              type="text"
              name="laboratorioId"
              value={formData.laboratorioId || ""}
              onChange={handleChange}
              placeholder="ID o nombre del laboratorio"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>
        </div>
      )}

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