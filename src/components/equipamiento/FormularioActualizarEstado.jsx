import { useMemo, useState } from "react";

// Estado que muestra el frontend (mapearEstado) -> string exacto del backend.
// El backend solo acepta estos tres valores para un equipo.
const estadoDisplayToBackend = {
  Disponible: "disponible",
  Mantenimiento: "mantenimiento",
  "Fuera de servicio": "fuera de servicio",
};

// Etiquetas legibles para cada destino posible.
const estadoLabel = {
  disponible: "Disponible",
  mantenimiento: "Mantenimiento",
  "fuera de servicio": "Fuera de servicio",
};

// Transiciones permitidas por el backend (doc, sección 4).
const transiciones = {
  disponible: ["mantenimiento", "fuera de servicio"],
  mantenimiento: ["disponible", "fuera de servicio"],
  "fuera de servicio": ["disponible"],
};

// Devuelve "ahora" en el formato local que espera un <input datetime-local>.
function ahoraLocal() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function FormularioActualizarEstado({
  equipo,
  onSubmit,
  cerrarModal,
  enviando = false,
}) {
  const estadoActual = estadoDisplayToBackend[equipo?.estado] || "disponible";
  const destinos = transiciones[estadoActual] || [];

  const [destino, setDestino] = useState(destinos[0] || "");
  const [tipo, setTipo] = useState("preventivo");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");

  const maxFecha = useMemo(() => ahoraLocal(), []);

  // Según el origen y el destino se decide qué endpoint usará el padre.
  const accion = useMemo(() => {
    if (destino === "mantenimiento") return "iniciarMantenimiento";
    if (estadoActual === "mantenimiento" && destino === "disponible")
      return "finalizarMantenimiento";
    return "cambioDirecto";
  }, [estadoActual, destino]);

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition";

  const submit = (e) => {
    e.preventDefault();
    if (!destino) return;

    const payload = { accion, destino };
    if (accion === "iniciarMantenimiento") {
      payload.tipo = tipo;
      payload.descripcion = descripcion.trim();
      payload.fecha = fecha ? new Date(fecha).toISOString() : undefined;
    } else if (accion === "finalizarMantenimiento") {
      payload.fecha = fecha ? new Date(fecha).toISOString() : undefined;
    } else {
      payload.estado = destino;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* EQUIPO (solo lectura) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Equipo
        </label>
        <input
          type="text"
          readOnly
          value={equipo ? `${equipo.tipo} · ${equipo.codigo}` : ""}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-not-allowed outline-none select-none"
        />
      </div>

      {/* ESTADO ACTUAL (solo lectura) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Estado actual
        </label>
        <input
          type="text"
          readOnly
          value={estadoLabel[estadoActual] || estadoActual}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-not-allowed outline-none select-none"
        />
      </div>

      {/* ESTADO DESTINO */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Nuevo estado
        </label>
        <select
          name="destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className={inputClass}
        >
          {destinos.map((d) => (
            <option key={d} value={d}>
              {estadoLabel[d] || d}
            </option>
          ))}
        </select>
      </div>

      {/* CAMPOS PARA ENTRAR EN MANTENIMIENTO */}
      {accion === "iniciarMantenimiento" && (
        <div className="space-y-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tipo de mantenimiento
            </label>
            <select
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={inputClass}
            >
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Descripción <span className="text-slate-400 normal-case">(opcional)</span>
            </label>
            <textarea
              name="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="3"
              maxLength={500}
              placeholder="Detalle del mantenimiento..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Fecha <span className="text-slate-400 normal-case">(opcional, no futura)</span>
            </label>
            <input
              type="datetime-local"
              name="fecha"
              value={fecha}
              max={maxFecha}
              onChange={(e) => setFecha(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* CAMPO PARA FINALIZAR MANTENIMIENTO */}
      {accion === "finalizarMantenimiento" && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Fecha de fin <span className="text-slate-400 normal-case">(opcional, no futura)</span>
          </label>
          <input
            type="datetime-local"
            name="fecha"
            value={fecha}
            max={maxFecha}
            onChange={(e) => setFecha(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {/* BOTONES */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={cerrarModal}
          disabled={enviando}
          className="px-4 py-2 rounded-lg text-sm border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando || !destino}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition disabled:opacity-50"
        >
          {enviando ? "Guardando..." : "Actualizar estado"}
        </button>
      </div>
    </form>
  );
}
