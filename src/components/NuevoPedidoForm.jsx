import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiX } from "react-icons/fi";

const STEPS = ["Datos Básicos", "Recursos", "Resumen", "Enviado"];

export default function NuevoPedidoForm({ onClose, onCrear, pedidoInicial = null,
  modo = "crear" }) {

  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [laboratorios, setLaboratorios] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [recursosDB, setRecursosDB] = useState([]);

  const [form, setForm] = useState({
    materia: "", 
    docente: "", 
    alumnos: "", 
    fecha: "", 
    hora: "10:00",
    laboratorio: "", 
    recursos: [], 
  });

  useEffect(() => {
    if (!pedidoInicial) return;

    const fecha = pedidoInicial.fechaHora
      ? pedidoInicial.fechaHora.split("T")[0]
      : "";

    const hora = pedidoInicial.fechaHora
      ? new Date(pedidoInicial.fechaHora)
          .toISOString()
          .slice(11, 16)
      : "10:00";

    // SOLUCIÓN AL BUG: Mapear los recursos existentes del pedido
    const recursosMapeados = pedidoInicial.recursos?.map(r => ({
      ...r.recursoId, // Trae los datos del recurso (nombre, etc)
      _id: r.recursoId?._id || r.recursoId, // Normaliza el ID
      cantidad: r.cantidad,
      tipoRecurso: r.tipoRecurso,
      tipoDetalle: r.tipo
    })) || [];

    setForm({
      materia: pedidoInicial.materia || "",
      docente: pedidoInicial.docente?._id || "",
      alumnos: pedidoInicial.alumnos || "",
      fecha,
      hora,
      laboratorio:
        pedidoInicial.laboratorio?.id ||
        pedidoInicial.laboratorio?._id ||
        "",
      recursos: recursosMapeados, // Ya no es un array vacío []
    });

    console.log("FORM CARGADO CON RECURSOS");

  }, [pedidoInicial]);

  const alumnos = Number(form.alumnos || 0);

  // Recuperar información real del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsRes, usersRes, equiposRes, itemsRes] = await Promise.allSettled([
          api.get("/laboratorio"),
          api.get("/usuarios"),
          api.get("/equipo"),
          api.get("/items")
        ]);

        if (labsRes.status === "fulfilled") setLaboratorios(labsRes.value.data);
        
        let docs = [];
        if (usersRes.status === "fulfilled") {
          const data = usersRes.value.data;
          const usuariosArray = Array.isArray(data) ? data : (data.usuarios || []);
          docs = usuariosArray.filter(u => u.rol === "DOCENTE");
        }

        // Solo autoseleccionamos si es pedido NUEVO
        if (!pedidoInicial && user && (user.id || user._id)) {
          const userId = user.id || user._id;
          const userInDocs = docs.find(d => (d._id === userId || d.id === userId));
          if (!userInDocs) {
            docs.push({ _id: userId, nombre: user.nombre || user.email || "Usuario", apellido: user.apellido || "Actual" });
          }
          setForm(prev => ({ ...prev, docente: userId }));
        }
        setDocentes(docs);

        let recursosRecopilados = [];
        
        if (equiposRes.status === "fulfilled") {
          const equipos = equiposRes.value.data
            // MEJORA: Filtramos disponibles O los que ya están en este pedido
            .filter(e => e.estado === "disponible" || (pedidoInicial?.recursos?.some(pr => (pr.recursoId?._id || pr.recursoId) === e._id)))
            .map(e => ({ ...e, tipoRecurso: "Equipo", tipoDetalle: "Equipo" }));
          recursosRecopilados = [...recursosRecopilados, ...equipos];
        }
        
        if (itemsRes.status === "fulfilled") {
          const items = itemsRes.value.data.map(i => ({
            ...i,
            tipoRecurso: "Item",
            tipoDetalle: i.tipo ? (i.tipo.charAt(0).toUpperCase() + i.tipo.slice(1)) : "Material"
          }));
          recursosRecopilados = [...recursosRecopilados, ...items];
        }

        setRecursosDB(recursosRecopilados);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, pedidoInicial]);
useEffect(() => {

  if (!form.fecha || !form.hora) {
    return;
  }

  const cargarDisponibles = async () => {

    try {

      const fechaHora =
        `${form.fecha}T${form.hora}`;

      const { data } =
        await api.get(
          "/laboratorio/disponibles-horario",
          {
            params: {
              fechaHora,
              alumnos: form.alumnos
            }
          }
        );

      setLaboratorios(data);

      // Si el laboratorio seleccionado dejó de estar disponible para
      // el nuevo horario/cantidad de alumnos, volvemos a "Asignación
      // posterior" (genérico) en lugar de dejar un ID inconsistente.
      if (form.laboratorio) {
        const sigueDisponible = data.some(
          (l) => (l._id || l.id) === form.laboratorio
        );
        if (!sigueDisponible) {
          setForm((f) => ({ ...f, laboratorio: "" }));
        }
      }

    } catch (error) {

      console.error(
        "Error cargando laboratorios",
        error
      );

    }
  };

  cargarDisponibles();

}, [
  form.fecha,
  form.hora,
  form.alumnos
]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleRecurso = (recurso) => {
    setForm((prev) => {
      const recursoId = recurso._id || recurso.id;
      const existe = prev.recursos.some((r) => (r._id || r.id) === recursoId);
      if (existe) {
        return { ...prev, recursos: prev.recursos.filter((r) => (r._id || r.id) !== recursoId) };
      } else {
        return { ...prev, recursos: [...prev.recursos, { ...recurso, cantidad: 1 }] };
      }
    });
  };

  const actualizarCantidad = (idRecurso, nuevaCantidad) => {
    setForm((prev) => ({
      ...prev,
      recursos: prev.recursos.map((r) => 
        (r._id || r.id) === idRecurso 
          ? { ...r, cantidad: Number(nuevaCantidad) } 
          : r
      )
    }));
  };

  const handleSiguiente = () => {
    if (step === 0) {
      if (!form.materia || !form.docente || !form.alumnos || !form.fecha || !form.hora) {
        alert("Error: Faltan completar datos obligatorios."); return;
      }
      if (Number(form.alumnos) <= 0) {
        alert("Error: La cantidad de alumnos debe ser mayor a 0."); return;
      }
      const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      if (new Date(form.fecha) < hoy) {
        alert("Error: La fecha no puede ser anterior a hoy."); return;
      }
      const labSeleccionado = laboratorios.find((l) => (l._id || l.id) === form.laboratorio);
      if (labSeleccionado && Number(form.alumnos) > labSeleccionado.capacidad) {
        alert("Error: El laboratorio no tiene capacidad suficiente."); return;
      }
    }
    if (step === 1 && form.recursos.length === 0) {
      alert("Error: Debes seleccionar al menos un recurso."); return;
    }
    setStep((s) => s + 1);
  };

  const handleCrear = async () => {
    const payload = {
      materia: form.materia,
      docente: form.docente,
      laboratorio: form.laboratorio || null,
      fecha: form.fecha,
      hora: form.hora,
      alumnos: Number(form.alumnos),
      recursos: form.recursos.map((r) => ({
        recursoId: r._id || r.id,
        tipoRecurso: r.tipoRecurso,
        modeloRef: r.tipoRecurso,
        tipo: r.tipoDetalle,
        cantidad: Number(r.cantidad)
      }))
    };
    try {
      await onCrear(payload);
      setStep(3);
    } catch (err) {
      console.error("Error al crear pedido:", err);
      alert("❌ Error al procesar el pedido");
      return;
    }
  };

  if (loading) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm"><div className="bg-white p-6 rounded-2xl">Cargando datos...</div></div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl shadow-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 text-xl"><FiX size={20} /></button>

        <div className="px-8 pt-6 pb-4">
          <div className="flex items-center mb-6">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                    ${i < step ? "bg-emerald-500 border-emerald-500 text-white" : i === step ? "border-emerald-500 text-emerald-600" : "border-zinc-200 text-zinc-400"}`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${i <= step ? "text-emerald-600" : "text-zinc-400"}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full ${i < step ? "bg-emerald-500" : "bg-zinc-100"}`} />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-600 mb-1">Materia</label>
                <input type="text" placeholder="Ej: Biología Celular" value={form.materia} onChange={set("materia")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-zinc-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Docente solicitante</label>
                <select value={form.docente} onChange={set("docente")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all">
                  <option value="">Seleccionar docente...</option>
                  {docentes.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.nombre} {d.apellido}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Cantidad de alumnos</label>
                <input type="number" placeholder="Ej: 28" value={form.alumnos} onChange={set("alumnos")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-zinc-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Fecha</label>
                <input type="date" value={form.fecha} onChange={set("fecha")} min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Hora de inicio</label>
                <input type="time" value={form.hora} onChange={set("hora")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-600 mb-1">Laboratorio</label>
                <select value={form.laboratorio} onChange={set("laboratorio")} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm">
                  <option value="">Seleccionar laboratorio...</option>
                  {laboratorios.map((l) => (
                    <option key={l._id || l.id} value={l._id || l.id} disabled={alumnos > l.capacidad}>
                      {l.nombre} (Cap: {l.capacidad}) {alumnos > l.capacidad ? " - NO DISPONIBLE" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-400 mt-1">
                  Si no seleccionás un laboratorio, el equipo de gestión asignará uno disponible antes de aprobar el pedido.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-zinc-500 text-sm italic">Seleccionar recursos requeridos e indicar cantidad:</p>
              <div className="max-h-[40vh] overflow-y-auto grid grid-cols-1 gap-2 pr-2">
                {recursosDB.map((r, i) => {
                  const seleccionado = form.recursos.find(rec => (rec._id || rec.id) === (r._id || r.id));
                  return (
                    <div key={i} className="flex items-center justify-between bg-white hover:bg-emerald-50 rounded-xl px-4 py-3 border border-zinc-200 hover:border-emerald-200 transition-colors group">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={!!seleccionado} onChange={() => toggleRecurso(r)} />
                        <div className="flex flex-col">
                          <span className="text-zinc-700 text-sm font-medium group-hover:text-emerald-800">{r.nombre} {r.tipoRecurso === 'Equipo' ? '(Disponible)' : ''}</span>
                          <span className="text-zinc-400 text-xs">{r.tipoDetalle}</span>
                        </div>
                      </label>
                      {seleccionado && (
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-zinc-500 font-medium">Cant:</span>
                          <input type="number" min="1" value={seleccionado.cantidad} onChange={(e) => actualizarCantidad(r._id || r.id, e.target.value)}
                            className="w-16 bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-center shadow-sm" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-1 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <p className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-4">Resumen del pedido</p>
              {[
                ["Materia", form.materia || "—"],
                ["Docente", docentes.find(d => (d._id || d.id) === form.docente) ? `${docentes.find(d => (d._id || d.id) === form.docente).nombre} ${docentes.find(d => (d._id || d.id) === form.docente).apellido}` : "—"],
                ["Alumnos", form.alumnos || "—"],
                ["Fecha y hora", form.fecha ? `${form.fecha} ${form.hora}` : "—"],
                ["Laboratorio", laboratorios.find(l => (l._id || l.id) === form.laboratorio)?.nombre || "Pendiente de asignación"],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between border-b border-zinc-200/60 py-2 last:border-0">
                  <span className="text-zinc-500 text-sm">{k}</span>
                  <span className="text-zinc-800 font-semibold text-sm text-right max-w-[200px]">{v}</span>
                </div>
              ))}
              <div className="pt-2">
                <span className="text-zinc-500 text-sm block mb-2">Recursos ({form.recursos.length}):</span>
                {form.recursos.map((r, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-1"><span className="text-zinc-600">- {r.nombre}</span><span className="font-medium text-zinc-800">x{r.cantidad}</span></div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-white shadow-sm flex items-center justify-center text-emerald-600 text-3xl">✓</div>
              <p className="text-zinc-800 font-bold text-xl">¡Pedido enviado!</p>
              <p className="text-zinc-500 text-sm text-center max-w-xs">Tu solicitud ha sido registrada correctamente.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between px-8 py-5 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl">
          <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)} className="px-5 py-2 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 transition-all shadow-sm">
            {step === 0 ? "Cancelar" : "Anterior"}
          </button>
          <button onClick={step < 2 ? handleSiguiente : handleCrear} className="px-6 py-2 rounded-xl text-sm bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-md">
            {step < 2 ? "Siguiente" : "Finalizar"}
          </button>
        </div>
      </div>
    </div>
  );
}