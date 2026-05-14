import FormularioLaboratorio from "./FormularioLaboratorio";
import NuevoLaboratorioForm from "./NuevoLabForm";

export default function LaboratorioModal({
  mostrar,
  cerrarModal,
  formData,
  handleChange,
  handleSubmit,
  esEdicion,
}) {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {esEdicion ? "Editar laboratorio" : "Nuevo laboratorio"}
        </h2>

        {esEdicion ? (
          <FormularioLaboratorio
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            cerrarModal={cerrarModal}
          />
        ) : (
          <NuevoLaboratorioForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            cerrarModal={cerrarModal}
          />
        )}
      </div>
    </div>
  );
}