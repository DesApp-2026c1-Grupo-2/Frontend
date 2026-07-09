import { useState, useEffect } from "react";
import { obtenerEdificios } from "../../services/edificioService";
import { obtenerLaboratoriosPorEdificio } from "../../services/laboratorioService";

export default function FormularioEquipo({
  formData = {},
  handleChange,
  handleSubmit,
  errores = {},
}) {
  const isFijo = formData.esFijo === true || String(formData.esFijo) === "true";

  const [edificios, setEdificios] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [loadingEdificios, setLoadingEdificios] = useState(false);
  const [loadingLaboratorios, setLoadingLaboratorios] = useState(false);
  const [errorUbicaciones, setErrorUbicaciones] = useState("");

  // Cargar edificios una sola vez, cuando el equipo pasa a "Fija"
  useEffect(() => {
    if (!isFijo || edificios.length > 0) return;

    const cargarEdificios = async () => {
      try {
        setLoadingEdificios(true);
        setErrorUbicaciones("");
        const data = await obtenerEdificios();
        setEdificios((data || []).filter((e) => e.estado !== false));
      } catch (err) {
        console.error("Error al cargar edificios:", err);
        setErrorUbicaciones("No se pudieron cargar los edificios.");
      } finally {
        setLoadingEdificios(false);
      }
    };
    cargarEdificios();
  }, [isFijo, edificios.length]);

  // Cargar laboratorios cada vez que cambia el edificio seleccionado
  useEffect(() => {
    if (!formData.edificioId) {
      return;
    }

    const cargarLaboratorios = async () => {
      try {
        setLoadingLaboratorios(true);
        setErrorUbicaciones("");
        const data = await obtenerLaboratoriosPorEdificio(formData.edificioId);
        setLaboratorios((data || []).filter((l) => l.estado !== "eliminado"));
      } catch (err) {
        console.error("Error al cargar laboratorios:", err);
        setErrorUbicaciones("No se pudieron cargar los laboratorios de ese edificio.");
      } finally {
        setLoadingLaboratorios(false);
      }
    };
    cargarLaboratorios();
  }, [formData.edificioId]);

  const handleEdificioChange = (e) => {
    handleChange(e); // actualiza edificioId en el estado del padre
    handleChange({ target: { name: "laboratorioId", value: "" } }); // resetea laboratorio
  };

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
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera de servicio">Fuera de servicio</option>
          </select>
        </div>
      </div>

      {/* UBICACIÓN CONDICIONAL (EDIFICIO Y LABORATORIO) */}
      {isFijo && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all duration-300">
          {errorUbicaciones && (
            <p className="sm:col-span-2 text-red-500 text-xs">{errorUbicaciones}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Edificio
            </label>
            <select
              name="edificioId"
              value={formData.edificioId || ""}
              onChange={handleEdificioChange}
              disabled={loadingEdificios}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {loadingEdificios ? "Cargando edificios..." : "Seleccionar edificio"}
              </option>
              {edificios.map((edificio) => (
                <option key={edificio.id} value={edificio.id}>
                  {edificio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Laboratorio
            </label>
            <select
              name="laboratorioId"
              value={formData.laboratorioId || ""}
              onChange={handleChange}
              disabled={!formData.edificioId || loadingLaboratorios}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {!formData.edificioId
                  ? "Elegí un edificio primero"
                  : loadingLaboratorios
                  ? "Cargando laboratorios..."
                  : "Seleccionar laboratorio"}
              </option>
              {laboratorios.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.nombre} · {lab.tipo} (cap. {lab.capacidad})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* BOTONES */}
      <div className="flex justify-end gap-3 pt-2">
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
