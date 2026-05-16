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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            Crear edificio
          </h2>
        </div>

        {/* FORM */}
        <div className="p-6">
          <FormularioEdificio
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            cerrarModal={cerrarModal}
          />
        </div>

      </div>
    </div>
  );
}