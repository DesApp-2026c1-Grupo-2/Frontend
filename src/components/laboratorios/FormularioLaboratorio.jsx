export default function FormularioLaboratorio({
  formData,
  handleChange,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="nombre"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        className="w-full border p-2 mb-3"
      />

      <input
        name="capacidad"
        placeholder="Capacidad"
        type="number"
        value={formData.capacidad}
        onChange={handleChange}
        className="w-full border p-2 mb-3"
      />

      <input
        name="tipo"
        placeholder="Tipo"
        value={formData.tipo}
        onChange={handleChange}
        className="w-full border p-2 mb-3"
      />

      <button className="bg-emerald-500 text-white px-4 py-2 rounded">
        Crear
      </button>
    </form>
  );
}