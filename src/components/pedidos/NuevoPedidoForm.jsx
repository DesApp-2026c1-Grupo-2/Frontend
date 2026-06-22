import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { FiX, FiLoader, FiCheckCircle } from "react-icons/fi";

const STEPS = ["Datos Básicos", "Recursos", "Resumen", "Enviado"];

export default function NuevoPedidoForm({ onClose, onCrear }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [laboratorios, setLaboratorios] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [recursosDB, setRecursosDB] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [actividadPlantilla, setActividadPlantilla] = useState("");
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState("");
  const [estadoEnvio, setEstadoEnvio] = useState(null);
  const [errores, setErrores] = useState({});

  const [form, setForm] = useState({
    materia: "", 
    docente: "", 
    alumnos: "", 
    fecha: "", 
    hora: "10:00",
    horaFin: "12:00",
    laboratorio: "", 
    recursos: [], 
  });

  const alumnos = Number(form.alumnos || 0);

  // Calcula la duración de la clase (en minutos) a partir de la hora de inicio y fin
  const calcularDuracionClase = (hora, horaFin) => {
    if (!hora || !horaFin) return null;
    const [hI, mI] = hora.split(":").map(Number);
    const [hF, mF] = horaFin.split(":").map(Number);
    const minutosInicio = hI * 60 + mI;
    const minutosFin = hF * 60 + mF;
    const duracion = minutosFin - minutosInicio;
    return duracion > 0 ? duracion : null;
  };

  // Recuperar información real del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Promise.allSettled evita que si una falla, todo el form colapse
        const [labsRes, usersRes, equiposRes, itemsRes, actividadesRes] = await Promise.allSettled([
          api.get("/laboratorio"),
          api.get("/usuarios"),
          api.get("/equipo"),
          api.get("/items"),
          api.get("/actividades")
        ]);

        if (actividadesRes.status === "fulfilled") {
          setActividades(actividadesRes.value.data);
        }

        if (labsRes.status === "fulfilled") setLaboratorios(labsRes.value.data);
        
        let docs = [];
        if (usersRes.status === "fulfilled") {
          const data = usersRes.value.data;
          const usuariosArray = Array.isArray(data) ? data : (data.usuarios || []);
          docs = usuariosArray.filter(u => u.rol === "DOCENTE");
        }

        // Garantizar que el usuario logueado aparezca en la lista y autoseleccionarlo por defecto
        if (user && (user.id || user._id)) {
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
            .filter(e => e.estado === "disponible") // Traemos solo equipos disponibles
            .map(e => ({ ...e, tipoRecurso: "Equipo", tipoDetalle: "Equipo" }));
          recursosRecopilados = [...recursosRecopilados, ...equipos];
        }
        
        if (itemsRes.status === "fulfilled") {
          const items = itemsRes.value.data.map(i => ({
            ...i,
            tipoRecurso: "Item",
            // Joi Schema requiere mayúscula inicial en el campo "tipo" -> "Material", "Reactivo", "Sustancia"
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
  }, [user]);

  // Filtrar laboratorios disponibles según el horario (inicio y fin) y la cantidad de alumnos
  useEffect(() => {
    if (!form.fecha || !form.hora || !form.horaFin) {
      return;
    }

    const duracionClase = calcularDuracionClase(form.hora, form.horaFin);
    if (!duracionClase) {
      return;
    }

    const cargarDisponibles = async () => {
      try {
        const fechaHora = `${form.fecha}T${form.hora}`;
        const fechaFin = `${form.fecha}T${form.horaFin}`;

        const { data } = await api.get("/laboratorio/disponibles-horario", {
          params: {
            fechaHora,
            fechaFin,
            alumnos: form.alumnos,
          },
        });

        setLaboratorios(data);

        // Si el laboratorio seleccionado dejó de estar disponible para el nuevo
        // horario/cantidad de alumnos, lo deseleccionamos para evitar un ID inconsistente.
        if (form.laboratorio) {
          const sigueDisponible = data.some(
            (l) => (l._id || l.id) === form.laboratorio
          );
          if (!sigueDisponible) {
            setForm((f) => ({ ...f, laboratorio: "" }));
          }
        }
      } catch (error) {
        console.error("Error cargando laboratorios", error);
      }
    };

    cargarDisponibles();
  }, [form.fecha, form.hora, form.horaFin, form.alumnos]);

  const set = (k) => (e) => {
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
    }));

    if (errores[k]) {
      setErrores((prev) => ({
        ...prev,
        [k]: undefined,
      }));
    }
  };

  const toggleRecurso = (recurso) => {

    if (errores.recursos) {
      setErrores((prev) => ({
        ...prev,
        recursos: undefined,
      }));
    }

    setForm((prev) => {
      const recursoId = recurso._id || recurso.id;

      const existe = prev.recursos.some(
        (r) => (r._id || r.id) === recursoId
      );

      if (existe) {
        return {
          ...prev,
          recursos: prev.recursos.filter(
            (r) => (r._id || r.id) !== recursoId
          ),
        };
      } else {
        return {
          ...prev,
          recursos: [
            ...prev.recursos,
            { ...recurso, cantidad: 1, deLaPlantilla: false },
          ],
        };
      }
    });
  };

  const actualizarCantidad = (idRecurso, nuevaCantidad) => {
    setForm((prev) => ({
      ...prev,
      recursos: prev.recursos.map((r) => 
        (r._id || r.id) === idRecurso 
          ? { ...r, cantidad: Number(nuevaCantidad), deLaPlantilla: false } 
          : r
      )
    }));
  };

  // Aplica una actividad como plantilla: trae los recursos sugeridos para su
  // tipo y los pre-selecciona (con su cantidad sugerida) en el formulario,
  // sin perder la posibilidad de seguir editando manualmente después.
  // Al cambiar de plantilla (o volver a "Sin plantilla"), se quitan los
  // recursos que habían sido agregados por la plantilla anterior, pero se
  // respetan los que el usuario agregó o ajustó manualmente.
  const aplicarPlantilla = async (actividadId) => {
    setActividadPlantilla(actividadId);

    // Quitar siempre lo que trajo la plantilla anterior (si la había)
    setForm((prev) => ({
      ...prev,
      recursos: prev.recursos.filter((r) => !r.deLaPlantilla),
    }));

    if (!actividadId) return;

    setCargandoSugerencias(true);
    try {
      const { data } = await api.get(`/actividades/${actividadId}/sugerencias`);

      const recursosSugeridos = [
        ...(data.items || []).map((s) => ({
          ...s.item,
          tipoRecurso: "Item",
          tipoDetalle: s.item.tipo
            ? s.item.tipo.charAt(0).toUpperCase() + s.item.tipo.slice(1)
            : "Material",
          cantidad: s.cantidadSugerida,
          deLaPlantilla: true,
        })),
        ...(data.equipos || [])
          .filter((s) => s.disponible)
          .map((s) => ({
            ...s.equipo,
            tipoRecurso: "Equipo",
            tipoDetalle: "Equipo",
            cantidad: s.cantidadSugerida,
            deLaPlantilla: true,
          })),
      ];

      setForm((prev) => {
        // No pisar recursos que el usuario ya haya agregado/ajustado a mano
        const recursosManuales = prev.recursos.filter((r) => !r.deLaPlantilla);

        const sugeridosSinDuplicar = recursosSugeridos.filter(
          (rs) =>
            !recursosManuales.some(
              (r) => (r._id || r.id) === (rs._id || rs.id)
            )
        );

        return {
          ...prev,
          recursos: [...recursosManuales, ...sugeridosSinDuplicar],
        };
      });
    } catch (error) {
      console.error("Error al cargar sugerencias de la actividad:", error);
    } finally {
      setCargandoSugerencias(false);
    }
  };


  const handleSiguiente = () => {
    if (step === 0) {
      const nuevosErrores = {};

      if (!form.materia) nuevosErrores.materia = "La materia es obligatoria";
      if (!form.docente) nuevosErrores.docente = "Seleccioná un docente";
      if (!form.alumnos) nuevosErrores.alumnos = "Ingresá la cantidad de alumnos";
      if (!form.fecha) nuevosErrores.fecha = "Seleccioná una fecha";
      if (!form.hora) nuevosErrores.hora = "Seleccioná una hora de inicio";
      if (!form.horaFin) nuevosErrores.horaFin = "Seleccioná una hora de finalización";

      if (Object.keys(nuevosErrores).length > 0) {
        setErrores(nuevosErrores);
        return;
      }

      setErrores({});

      const alumnos = Number(form.alumnos);

      //validar alumnos negativos o 0
      if (alumnos <= 0) {
        alert("Error: La cantidad de alumnos debe ser mayor a 0.");
        return;
      }

      // validar horario de finalización posterior al de inicio
      if (!calcularDuracionClase(form.hora, form.horaFin)) {
        alert("Error: La hora de finalización debe ser posterior a la hora de inicio.");
        return;
      }

      // validar fecha
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const [year, month, day] = form.fecha.split("-").map(Number);
      const fechaSeleccionada = new Date(year, month - 1, day);

      if (fechaSeleccionada < hoy) {
        alert("Error: La fecha no puede ser anterior a hoy.");
        return;
      }

      // validar capacidad laboratorio
      const labSeleccionado = laboratorios.find(
        (l) => (l._id || l.id) === form.laboratorio
      );

      if (labSeleccionado && alumnos > labSeleccionado.capacidad) {
        alert("Error: El laboratorio no tiene capacidad suficiente.");
        return;
      }
    }

    if (step === 1) {
      setErrores({});
    }

    setStep((s) => s + 1);
  };

  const handleCrear = async () => {
    setErrorSubmit("");
    const payload = {
      materia: form.materia,
      docente: form.docente,
      laboratorio: form.laboratorio || null,
      fecha: form.fecha,
      hora: form.hora,
      duracionClase: calcularDuracionClase(form.hora, form.horaFin),
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
      setEstadoEnvio("loading");

      await onCrear(payload);

      setEstadoEnvio("success");

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setEstadoEnvio(null);

      console.error("Error al crear pedido:", err.response?.data);

      const serverError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Ocurrió un error al procesar el pedido.";

      const detalles = err.response?.data?.detalles
        ? err.response.data.detalles.map((d) => d.message).join(", ")
        : "";

      setErrorSubmit(`${serverError} ${detalles}`.trim());

      return;
    }
  };

  if (loading) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm"><div className="bg-white p-6 rounded-2xl">Cargando datos...</div></div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl shadow-xl relative">
        {/* CRUZ */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 text-xl"
        >
          <FiX size={20} />
        </button>

        <div className="px-8 pt-6 pb-4">
           
          {/* Stepper */}
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
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full ${i < step ? "bg-emerald-500" : "bg-zinc-100"}`} />
                )}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-600 mb-1">
                  Materia
                </label>

                <input type="text" placeholder="Ej: Biología Celular" value={form.materia} onChange={set("materia")}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none transition-all placeholder:text-zinc-400
                    ${
                      errores.materia
                        ? "border-red-400 focus:border-red-500"
                        : "border-zinc-200 focus:border-emerald-500"
                    }`
                  }
                />

                {errores.materia && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.materia}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">
                  Docente solicitante
                </label>
                <select value={form.docente} onChange={set("docente")}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none transition-all
                    ${
                      errores.docente
                        ? "border-red-400 focus:border-red-500"
                        : "border-zinc-200 focus:border-emerald-500"
                    }`}
                >
                  <option value="">Seleccionar docente...</option>
                  {docentes.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.nombre} {d.apellido}</option>)}
                </select>

                {errores.docente && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.docente}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">
                  Cantidad de alumnos
                </label>
                <input type="number" placeholder="Ej: 28" value={form.alumnos} onChange={set("alumnos")}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none transition-all
                    ${
                      errores.alumnos
                        ? "border-red-400 focus:border-red-500"
                        : "border-zinc-200 focus:border-emerald-500"
                    }`}
                                
                />
                
                {errores.alumnos && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.alumnos}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={set("fecha")}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none transition-all
                    ${
                      errores.fecha
                        ? "border-red-400 focus:border-red-500"
                        : "border-zinc-200 focus:border-emerald-500"
                    }`}
                />

                {errores.fecha && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.fecha}
                  </p>
                )}
              </div>

              {/* Columna vacía para mantener fecha sola en su fila */}
              <div />

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Hora de inicio</label>
                <input type="time" value={form.hora} onChange={set("hora")}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none transition-all
                  ${
                    errores.hora
                      ? "border-red-400 focus:border-red-500"
                      : "border-zinc-200 focus:border-emerald-500"
                  }`} 
                />
                {errores.hora && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.hora}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Hora de finalización</label>
                <input type="time" value={form.horaFin} onChange={set("horaFin")}
                  className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none transition-all
                    ${
                      errores.horaFin
                        ? "border-red-400 focus:border-red-500"
                        : "border-zinc-200 focus:border-emerald-500"
                    }`} 
                />
                {errores.horaFin && (
                  <p className="text-red-500 text-xs mt-1">
                    {errores.horaFin}
                  </p>
                )}
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-600 mb-1">Laboratorio</label>
                <select
                  value={form.laboratorio}
                  onChange={set("laboratorio")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm"
                >
                  <option value="">Seleccionar laboratorio...</option>

                  {laboratorios.map((l) => {
                    const noDisponible = alumnos > l.capacidad;

                    return (
                      <option
                        key={l._id || l.id}
                        value={l._id || l.id}
                        disabled={noDisponible}
                      >
                        {l.nombre} (Cap: {l.capacidad})
                        {noDisponible ? " - NO DISPONIBLE" : ""}
                      </option>
                    );
                  })}
                </select>
                <p className="text-xs text-zinc-400 mt-1">
                  Si no seleccionás un laboratorio, el equipo de gestión asignará uno disponible antes de aprobar el pedido.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-zinc-500 text-sm italic">
                Seleccionar recursos requeridos e indicar cantidad (opcional, por ejemplo en una clase teórica puede no necesitarse ninguno):
              </p>

              {actividades.length > 0 && (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3">
                  <label className="block text-sm font-medium text-zinc-600 mb-1">
                    Usar actividad como plantilla (opcional)
                  </label>
                  <select
                    value={actividadPlantilla}
                    onChange={(e) => aplicarPlantilla(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="">Sin plantilla...</option>
                    {actividades.map((a) => (
                      <option key={a._id || a.id} value={a._id || a.id}>
                        {a.nombre} ({a.tipo})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-400 mt-1">
                    Precarga los recursos sugeridos para el tipo de actividad elegido. Podés seguir agregando, quitando o ajustando cantidades después.
                  </p>
                  {cargandoSugerencias && (
                    <p className="text-xs text-emerald-600 mt-1">Cargando recursos sugeridos...</p>
                  )}
                </div>
              )}

              {errores.recursos && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm font-medium">
                    {errores.recursos}
                  </p>
                </div>
              )}

              <div className="max-h-[40vh] overflow-y-auto grid grid-cols-1 gap-2 pr-2">
                {recursosDB.map((r, i) => {
                  const seleccionado = form.recursos.find(rec => (rec._id || rec.id) === (r._id || r.id));
                  
                  return (
                    <div key={i} className="flex items-center justify-between bg-white hover:bg-emerald-50 rounded-xl px-4 py-3 border border-zinc-200 hover:border-emerald-200 transition-colors group">
                      
                      {/* Lado Izquierdo: Checkbox y Texto (clickable) */}
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input 
                          type="checkbox" 
                          className="accent-emerald-500 w-4 h-4"
                          checked={!!seleccionado}
                          onChange={() => toggleRecurso(r)}
                        />
                        <div className="flex flex-col">
                          <span className="text-zinc-700 text-sm font-medium group-hover:text-emerald-800">
                            {r.nombre} {r.tipoRecurso === 'Equipo' ? '(Disponible)' : ''}
                          </span>
                          <span className="text-zinc-400 text-xs">{r.tipoDetalle}</span>
                        </div>
                      </label>

                      {/* Lado Derecho: Input de cantidad (solo aparece si está tildado) */}
                      {seleccionado && (
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-zinc-500 font-medium">Cant:</span>
                          <input 
                            type="number" 
                            min="1" 
                            value={seleccionado.cantidad} 
                            onChange={(e) => actualizarCantidad(r._id || r.id, e.target.value)}
                            className="w-16 bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-center shadow-sm"
                          />
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
                ["Docente", docentes.find(d => (d._id || d.id) === form.docente) 
                  ? `${docentes.find(d => (d._id || d.id) === form.docente).nombre} ${docentes.find(d => (d._id || d.id) === form.docente).apellido}` 
                  : "—"],
                ["Alumnos", form.alumnos || "—"],
                ["Fecha y hora", form.fecha ? `${form.fecha} ${form.hora} a ${form.horaFin}` : "—"],
                ["Laboratorio", laboratorios.find(l => (l._id || l.id) === form.laboratorio)?.nombre || "Pendiente de asignación"],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between border-b border-zinc-200/60 py-2 last:border-0">
                  <span className="text-zinc-500 text-sm">{k}</span>
                  <span className="text-zinc-800 font-semibold text-sm text-right max-w-[200px]">{v}</span>
                </div>
              ))}
              
              {/* Desglose de recursos en el resumen */}
              <div className="pt-2">
                <span className="text-zinc-500 text-sm block mb-2">Recursos ({form.recursos.length}):</span>
                {form.recursos.length === 0 ? (
                  <p className="text-zinc-400 text-xs italic">Sin recursos solicitados.</p>
                ) : (
                  form.recursos.map((r, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1">
                      <span className="text-zinc-600">- {r.nombre}</span>
                      <span className="font-medium text-zinc-800">x{r.cantidad}</span>
                    </div>
                  ))
                )}
              </div>

            {errorSubmit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                <strong>Error:</strong> {errorSubmit}
              </div>
            )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-white shadow-sm flex items-center justify-center text-emerald-600 text-3xl">✓</div>
              <p className="text-zinc-800 font-bold text-xl">¡Pedido enviado!</p>
              <p className="text-zinc-500 text-sm text-center max-w-xs">Tu solicitud ha sido registrada y será revisada por el equipo técnico a la brevedad.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between px-8 py-5 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl">
          <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
            className="px-5 py-2 rounded-xl text-sm font-medium text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-800 transition-all shadow-sm">
            {step === 0 ? "Cancelar" : "Anterior"}
          </button>
          
          {step < 2 ? (
            <button onClick={handleSiguiente}
              className="px-6 py-2 rounded-xl text-sm bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200">
              Siguiente
            </button>
          ) : step === 2 ? (
            <button onClick={handleCrear} disabled={estadoEnvio === "loading"}
              className="px-6 py-2 rounded-xl text-sm bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Finalizar
            </button>
          ) : null}
        </div>
      </div>
      {estadoEnvio && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">

        <div className="
          w-full max-w-sm
          bg-white
          rounded-3xl
          shadow-2xl
          border border-zinc-200
          p-8
          flex flex-col items-center
          text-center
          animate-fade-in
        ">

          {estadoEnvio === "loading" ? (
            <>
              <FiLoader
                size={56}
                className="text-emerald-600 animate-spin mb-5"
              />

              <h3 className="text-xl font-bold text-zinc-800">
                Enviando pedido...
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Estamos registrando tu solicitud.
              </p>
            </>
          ) : (
            <>
              <FiCheckCircle
                size={64}
                className="text-emerald-600 mb-5"
              />

              <h3 className="text-xl font-bold text-zinc-800">
                ¡Pedido enviado!
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Tu solicitud fue registrada correctamente y será revisada por el equipo técnico.
              </p>
            </>
          )}

        </div>
      </div>
    )}
    </div>
    
  );
}