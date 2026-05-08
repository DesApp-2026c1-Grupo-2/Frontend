export default function FormularioEdificio({
  formData,
  handleChange,
  handleSubmit,
  cerrarModal,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      {/* NOMBRE */}
      <div>
        <label className="block mb-2 font-medium">
          Nombre
        </label>

        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Edificio Central"
          required
          className="
            w-full
            border
            border-gray-300
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />
      </div>

      {/* DIRECCION */}
      <div>
        <label className="block mb-2 font-medium">
          Dirección
        </label>

        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Av. Siempre Viva 123"
          required
          className="
            w-full
            border
            border-gray-300
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />
      </div>

      {/* CANTIDAD AULAS */}
      <div>
        <label className="block mb-2 font-medium">
          Cantidad de aulas
        </label>

        <input
          type="number"
          name="cantidadAulas"
          value={formData.cantidadAulas}
          onChange={handleChange}
          min="0"
          placeholder="10"
          required
          className="
            w-full
            border
            border-gray-300
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3 pt-2">

        <button
          type="button"
          onClick={cerrarModal}
          className="
            px-4
            py-2
            rounded-xl
            bg-gray-200
            hover:bg-gray-300
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="
            px-4
            py-2
            rounded-xl
            bg-blue-600
            text-white
            hover:bg-blue-700
          "
        >
          Guardar
        </button>

      </div>
    </form>
  );
}