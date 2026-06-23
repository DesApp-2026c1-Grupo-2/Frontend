import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FiX } from "react-icons/fi";

/**
 * Modal dedicado a EDITAR un pedido existente.
 * Solo envía al backend los campos que cambiaron.
 *
 * Props:
 *   pedido   – objeto poblado que viene del backend (docente, laboratorio como objetos)
 *   onClose  – fn para cerrar
 *   onGuardar – fn(payload) async, maneja el PUT y el re-fetch
 */
export default function EditarPedidoForm({ pedido, onClose, onGuardar }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [laboratorios, setLaboratorios] = useState([]);
  const [recursosDB, setRecursosDB] = useState([]);
  const [errores, setErrores] = useState({});
  const [errorGuardar, setErrorGuardar] = useState("");

  // ─── Extraer valores iniciales del pedido poblado ────────────────────────────
  const extraerHora = (fechaHoraStr) => {
    if (!fechaHoraStr) return "10:00";
    const d = new Date(fechaHoraStr);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const extraerFecha = (fechaHoraStr) => {
    if (!fechaHoraStr) return "";
    return new Date(fechaHoraStr).toISOString().split("T")[0];
  };

  const minutosAHora = (horaStr, minutos) => {
    const [h, m] = horaStr.split(":").map(Number);
    const total = h * 60 + m + minutos;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  const horaInicio = extraerHora(pedido.fechaHora);
  const horaFin = minutosAHora(horaInicio, pedido.duracionClase || 120);

  // ID del laboratorio — puede venir poblado o como string
  const labId =
    typeof pedido.laboratorio === "object"
      ? pedido.laboratorio?._id || pedido.laboratorio?.id || ""
      : pedido.laboratorio || "";

  const [form, setForm] = useState({
    materia: pedido.materia || "",
    alumnos: String(pedido.alumnos || ""),
    fecha: extraerFecha(pedido.fechaHora),
    hora: horaInicio,
    horaFin: horaFin,
    laboratorio: labId,
    recursos: [], // se hidrata después de cargar recursosDB
  });

  // ─── Cargar laboratorios y recursos ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsRes, equiposRes, itemsRes] = await Promise.allSettled([
          api.get("/laboratorio"),
          api.get("/equipo"),
          api.get("/items"),
        ]);

        if (labsRes.status === "fulfilled") setLaboratorios(labsRes.value.data);

        let recopilados = [];
        if (equiposRes.status === "fulfilled") {
          const equipos = equiposRes.value.data
            .filter((e) => e.estado === "disponible" || pedido.recursos?.some(
              (r) => (r.recursoId?._id || r.recursoId) === e._id
            ))
            .map((e) => ({ ...e, tipoRecurso: "Equipo", tipoDetalle: "Equipo" }));
          recopilados = [...recopilados, ...equipos];
        }
        if (itemsRes.status === "fulfilled") {
          const items = itemsRes.value.data.map((i) => ({
            ...i,
            tipoRecurso: "Item",
            tipoDetalle: i.tipo
              ? i.tipo.charAt(0).toUpperCase() + i.tipo.slice(1)
              : "Material",
          }));
          recopilados = [...recopilados, ...items];
        }

        setRecursosDB(recopilados);

        // Hidratar recursos del pedido original
        const recursosIniciales = (pedido.recursos || []).map((r) => {
          const recId = r.recursoId?._id || r.recursoId;
          const encontrado = recopilados.find(
            (rec) => (rec._id || rec.id) === recId
          );
          return {
            ...(encontrado || {}),
            _id: recId,
            recursoId: recId,
            tipoRecurso: r.tipoRecurso || r.tipo,
            tipoDetalle: r.tipoDetalle || r.tipo,
            nombre: r.recursoId?.nombre || encontrado?.nombre || "Recurso",
            cantidad: r.cantidad,
          };
        });

        setForm((prev) => ({ ...prev, recursos: recursosIniciales }));
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errores[k]) setErrores((prev) => ({ ...prev, [k]: undefined }));
  };

  const calcularDuracion = (inicio, fin) => {
    if (!inicio || !fin) return null;
    const [hI, mI] = inicio.split(":").map(Number);
    const [hF, mF] = fin.split(":").map(Number);
    const d = hF * 60 + mF - (hI * 60 + mI);
    return d > 0 ? d : null;
  };

  const toggleRecurso = (recurso) => {
    setForm((prev) => {
      const rid = recurso._id || recurso.id;
      const existe = prev.recursos.some((r) => (r._id || r.id) === rid);
      if (existe) {
        return { ...prev, recursos: prev.recursos.filter((r) => (r._id || r.id) !== rid) };
      }
      return { ...prev, recursos: [...prev.recursos, { ...recurso, cantidad: 1 }] };
    });
  };

  const actualizarCantidad = (id, val) => {
    setForm((prev) => ({
      ...prev,
      recursos: prev.recursos.map((r) =>
        (r._id || r.id) === id ? { ...r, cantidad: Number(val) } : r
      ),
    }));
  };

  // ─── Submit — solo manda IDs, nunca objetos poblados ─────────────────────────
  const handleGuardar = async () => {
    setErrorGuardar("");

    const nuevosErrores = {};
    if (!form.materia) nuevosErrores.materia = "La materia es obligatoria.";
    if (!form.alumnos) nuevosErrores.alumnos = "Ingresá la cantidad de alumnos.";
    if (Number(form.alumnos) <= 0) nuevosErrores.alumnos = "La cantidad de alumnos debe ser mayor a 0.";
    if (!form.fecha) nuevosErrores.fecha = "Seleccioná una fecha.";
    if (!form.hora) nuevosErrores.hora = "Seleccioná una hora de inicio.";
    if (!form.horaFin) nuevosErrores.horaFin = "Seleccioná una hora de finalización.";

    const duracionClase = calcularDuracion(form.hora, form.horaFin);
    if (form.hora && form.horaFin && !duracionClase) {
      nuevosErrores.horaFin = "La hora de finalización debe ser posterior a la hora de inicio.";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});

    // ⚠️  SOLO mandamos IDs — nunca objetos poblados — para que normalize() funcione
    const payload = {
      materia: form.materia,
      alumnos: Number(form.alumnos),
      fecha: form.fecha,
      hora: form.hora,
      duracionClase,
      laboratorio: form.laboratorio || null,
      recursos: form.recursos.map((r) => ({
        recursoId: r._id || r.recursoId || r.id,
        tipoRecurso: r.tipoRecurso,
        modeloRef: r.tipoRecurso,
        tipo: r.tipoDetalle,
        cantidad: Number(r.cantidad),
      })),
    };

    setSaving(true);
    try {
      await onGuardar(payload);
    } catch (err) {
      console.error("Error al guardar:", err);
      setErrorGuardar(err.response?.data?.error || "Error al actualizar el pedido.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-2xl">Cargando datos...</div>
      </div>
    );
  }

  const alumnos = Number(form.alumnos || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl shadow-xl relative max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-zinc-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-zinc-800">Editar pedido</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Solo se guardarán los campos que modifiques.</p>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <div className="px-8 py-5 overflow-y-auto flex-1 space-y-6">

          {/* ── Datos básicos ─────────────────────────────── */}
          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Datos básicos
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-600 mb-1">Materia</label>
                <input
                  type="text"
                  value={form.materia}
                  onChange={set("materia")}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 ${errores.materia ? "border-red-400" : "border-zinc-200"}`}
                />
                {errores.materia && <p className="text-red-500 text-xs mt-1">{errores.materia}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Alumnos</label>
                <input
                  type="number"
                  value={form.alumnos}
                  onChange={set("alumnos")}
                  min="1"
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 ${errores.alumnos ? "border-red-400" : "border-zinc-200"}`}
                />
                {errores.alumnos && <p className="text-red-500 text-xs mt-1">{errores.alumnos}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={set("fecha")}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 ${errores.fecha ? "border-red-400" : "border-zinc-200"}`}
                />
                {errores.fecha && <p className="text-red-500 text-xs mt-1">{errores.fecha}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Hora de inicio</label>
                <input
                  type="time"
                  value={form.hora}
                  onChange={set("hora")}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 ${errores.hora ? "border-red-400" : "border-zinc-200"}`}
                />
                {errores.hora && <p className="text-red-500 text-xs mt-1">{errores.hora}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Hora de finalización</label>
                <input
                  type="time"
                  value={form.horaFin}
                  onChange={set("horaFin")}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 ${errores.horaFin ? "border-red-400" : "border-zinc-200"}`}
                />
                {errores.horaFin && <p className="text-red-500 text-xs mt-1">{errores.horaFin}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-600 mb-1">Laboratorio</label>
                <select
                  value={form.laboratorio}
                  onChange={set("laboratorio")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm"
                >
                  <option value="">Sin asignar</option>
                  {laboratorios.map((l) => {
                    const noDisponible = alumnos > l.capacidad;
                    return (
                      <option
                        key={l._id || l.id}
                        value={l._id || l.id}
                        disabled={noDisponible}
                      >
                        {l.nombre} (Cap: {l.capacidad})
                        {noDisponible ? " — sin capacidad" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </section>

          {/* ── Recursos ──────────────────────────────────── */}
          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Recursos
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {recursosDB.map((r) => {
                const rid = r._id || r.id;
                const seleccionado = form.recursos.find(
                  (rec) => (rec._id || rec.recursoId || rec.id) === rid
                );
                return (
                  <div
                    key={rid}
                    className="flex items-center justify-between bg-white hover:bg-emerald-50 rounded-xl px-4 py-3 border border-zinc-200 hover:border-emerald-200 transition-colors group"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        className="accent-emerald-500 w-4 h-4"
                        checked={!!seleccionado}
                        onChange={() => toggleRecurso(r)}
                      />
                      <div>
                        <span className="text-zinc-700 text-sm font-medium group-hover:text-emerald-800">
                          {r.nombre}
                          {r.tipoRecurso === "Equipo" ? " (Disponible)" : ""}
                        </span>
                        <span className="block text-zinc-400 text-xs">{r.tipoDetalle}</span>
                      </div>
                    </label>
                    {seleccionado && (
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-zinc-500 font-medium">Cant:</span>
                        <input
                          type="number"
                          min="1"
                          value={seleccionado.cantidad}
                          onChange={(e) => actualizarCantidad(rid, e.target.value)}
                          className="w-16 bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 text-zinc-800 text-sm text-center focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 px-8 py-5 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl flex-shrink-0">
          {errorGuardar && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              <strong>Error:</strong> {errorGuardar}
            </div>
          )}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="px-6 py-2 rounded-xl text-sm bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
