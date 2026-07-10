import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const TIPOS = [
  { value: "quimica", label: "Química" },
  { value: "biologia", label: "Biología" },
  { value: "teorica", label: "Teórica" },
];

const ESTADOS = [
  { value: "planificada", label: "Planificada" },
  { value: "en_proceso", label: "En proceso" },
  { value: "finalizada", label: "Finalizada" },
];

const FORM_INICIAL = {
  nombre: "",
  tipo: "quimica",
  fecha: "",
  estado: "planificada",
};

export default function FormularioActividad({ actividad, onGuardar, onCerrar }) {
  const esEdicion = Boolean(actividad);

  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [errorBackend, setErrorBackend] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Prellenar si es edición
  useEffect(() => {
    if (actividad) {
      setForm({
        nombre: actividad.nombre || "",
        tipo: actividad.tipo || "quimica",
        fecha: actividad.fecha
          ? new Date(actividad.fecha).toISOString().slice(0, 10)
          : "",
        estado: actividad.estado || "planificada",
      });
    } else {
      setForm(FORM_INICIAL);
    }
    setErrores({});
    setErrorBackend("");
  }, [actividad]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errores[k]) setErrores((prev) => ({ ...prev, [k]: undefined }));
  };

  const validar = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!form.fecha) errs.fecha = "La fecha es obligatoria.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBackend("");

    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        fecha: form.fecha,
        estado: form.estado,
      });
    } catch (err) {
      setErrorBackend(
        err.response?.data?.error || "Error al guardar la actividad."
      );
    } finally {
      setGuardando(false);
    }
  };

  const inputClass = (campo) =>
    `w-full rounded-xl border px-3 py-2 text-sm text-zinc-800 bg-zinc-50 focus:outline-none focus:border-emerald-500 transition ${
      errores[campo] ? "border-red-400" : "border-zinc-200"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-zinc-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-base font-bold text-zinc-800">
            {esEdicion ? "Editar actividad" : "Nueva actividad"}
          </h2>
          <button
            onClick={onCerrar}
            className="text-zinc-400 hover:text-zinc-600 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {errorBackend && (
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <span><strong>Error:</strong> {errorBackend}</span>
              <button
                type="button"
                onClick={() => setErrorBackend("")}
                className="ml-3 font-bold text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={set("nombre")}
              placeholder="Ej. Práctica de titulación"
              className={inputClass("nombre")}
            />
            {errores.nombre && (
              <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">
              Tipo
            </label>
            <select value={form.tipo} onChange={set("tipo")} className={inputClass("tipo")}>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={form.fecha}
              onChange={set("fecha")}
              className={inputClass("fecha")}
            />
            {errores.fecha && (
              <p className="text-red-500 text-xs mt-1">{errores.fecha}</p>
            )}
          </div>

          {/* Estado (solo en edición) */}
          {esEdicion && (
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-1">
                Estado
              </label>
              <select value={form.estado} onChange={set("estado")} className={inputClass("estado")}>
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-5 py-2 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-60"
            >
              {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear actividad"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
