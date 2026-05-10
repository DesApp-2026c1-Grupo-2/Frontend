export default function FormularioLaboratorio({
  formData,
  handleChange,
  handleSubmit,
  cerrarModal,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        placeholder="Nombre"
        className="w-full border p-2 rounded"
      />

      <input
        name="capacidad"
        type="number"
        value={formData.capacidad}
        onChange={handleChange}
        placeholder="Capacidad"
        className="w-full border p-2 rounded"
      />

      <input
        name="tipo"
        value={formData.tipo}
        onChange={handleChange}
        placeholder="Tipo"
        className="w-full border p-2 rounded"
      />

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