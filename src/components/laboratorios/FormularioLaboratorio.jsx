export default function FormularioLaboratorio({
  formData,
  handleChange,
  handleSubmit,
  cerrarModal,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* NOMBRE */}
      <input
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        placeholder="Nombre"
        className="w-full border p-2 rounded"
      />

      {/* CAPACIDAD */}
      <input
        name="capacidad"
        type="number"
        value={formData.capacidad}
        onChange={handleChange}
        placeholder="Capacidad"
        className="w-full border p-2 rounded"
      />

      {/* TIPO (IMPORTANTE) */}
      <select
        name="tipo"
        value={formData.tipo}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      >
        <option value="">Seleccionar tipo</option>
        <option value="biologia">Biología</option>
        <option value="quimica">Química</option>
        <option value="mixto">Mixto</option>
      </select>

      {/* ESTADO (opcional pero recomendable controlarlo también) */}
      <select
        name="estado"
        value={formData.estado}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option value="disponible">Disponible</option>
        <option value="reservado">Reservado</option>
        <option value="en mantenimiento">En mantenimiento</option>
        <option value="fuera de servicio">Fuera de servicio</option>
      </select>

      {/* BOTONES */}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={cerrarModal}>
          Cancelar
        </button>

        <button className="bg-emerald-500 text-white px-3 py-2 rounded">
          Crear
        </button>
      </div>
    </form>
  );
}