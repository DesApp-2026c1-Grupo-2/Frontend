import FormularioEdificio from "./FormularioEdificio";

export default function CrearEdificioModal({
  mostrar,
  cerrarModal,
  formData,
  handleChange,
  handleSubmit,
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

        <h2 className="text-2xl font-bold mb-5">
          Crear edificio
        </h2>

        <FormularioEdificio
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          cerrarModal={cerrarModal}
        />

      </div>
    </div>
  );
}