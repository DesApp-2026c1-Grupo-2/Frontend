import { useState } from "react";
import { STEPS, LABS } from '../data/pedidos'; 

const RECURSOS_DB = [
  { tipo: "Material", nombre: "Tubos eppendorf", cantidad: 60 },
  { tipo: "Reactivo", nombre: "Buffer de lisis", cantidad: 1 }, 
  { tipo: "Equipo", nombre: "Micropipetas P200", cantidad: 4 },
  { tipo: "Equipo", nombre: "Espectrofotómetro UV", cantidad: 1 },
  { tipo: "Equipo", nombre: "Centrífuga de mesa", cantidad: 2 }
];

export default function NuevoPedidoForm({ onClose, onCrear }) {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    materia: "", 
    docente: "", 
    alumnos: "", 
    fecha: "", 
    hora: "10:00",
    laboratorio: "", 
    recursos: [], 
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleRecurso = (recurso) => {
    setForm((prev) => {
      const existe = prev.recursos.some((r) => r.nombre === recurso.nombre);
      if (existe) {
        return { ...prev, recursos: prev.recursos.filter((r) => r.nombre !== recurso.nombre) };
      } else {
        // Se agrega con cantidad: 1 por defecto al tildarlo
        return { ...prev, recursos: [...prev.recursos, { ...recurso, cantidad: 1 }] };
      }
    });
  };

  // NUEVA FUNCIÓN: Actualiza la cantidad de un recurso ya seleccionado
  const actualizarCantidad = (nombreRecurso, nuevaCantidad) => {
    setForm((prev) => ({
      ...prev,
      recursos: prev.recursos.map((r) => 
        r.nombre === nombreRecurso 
          ? { ...r, cantidad: Number(nuevaCantidad) } 
          : r
      )
    }));
  };

  const handleSiguiente = () => {
    // Validaciones del Paso 0: Datos Básicos
    if (step === 0) {
      if (!form.materia || !form.docente || !form.alumnos || !form.fecha || !form.hora || !form.laboratorio) {
        alert("Error: Faltan completar datos obligatorios en el formulario.");
        return;
      }

      // Simulación de laboratorio ocupado
      const laboratorioOcupado = form.laboratorio === "Laboratorio A" && form.hora === "10:00"; 
      if (laboratorioOcupado) {
        alert("Error: El laboratorio seleccionado no está disponible en esa fecha y hora.");
        return;
      }
    }

    // Validaciones del Paso 1: Recursos y Equipos
    if (step === 1) {
      let errorEquipo = false;
      let errorStock = false;

      form.recursos.forEach((recursoSolicitado) => {
        const recursoDB = RECURSOS_DB.find(r => r.nombre === recursoSolicitado.nombre);
        
        // Ahora sí comparamos la cantidad que el usuario escribió vs el stock
        if (recursoDB && recursoSolicitado.cantidad > recursoDB.cantidad) {
          if (recursoDB.tipo === "Equipo") {
            errorEquipo = true;
          } else {
            errorStock = true;
          }
        }
      });

      if (errorEquipo) {
        alert("Error: Hay equipos insuficientes para satisfacer este pedido. Revisa las cantidades.");
        return;
      }

      if (errorStock) {
        alert("Error: Hay stock insuficiente de materiales o reactivos para este pedido. Revisa las cantidades.");
        return;
      }
    }

    setStep((s) => s + 1);
  };

  const handleCrear = () => {
    const payload = {
      ...form,
      alumnos: Number(form.alumnos)
    };
    onCrear(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="px-8 pt-6 pb-4">
          
          {/* Stepper */}
          <div className="flex items-center mb-8">
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
                <label className="block text-sm font-medium text-zinc-600 mb-1">Materia</label>
                <input type="text" placeholder="Ej: Biología Celular" value={form.materia} onChange={set("materia")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-zinc-400" />
              </div>

              {[["Docente solicitante","docente","text","Dr. Herrera"],["Cantidad de alumnos","alumnos","number","28"]].map(([label,key,type,ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">{label}</label>
                  <input type={type} placeholder={ph} value={form[key]} onChange={set(key)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-zinc-400" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Fecha</label>
                <input type="date" value={form.fecha} onChange={set("fecha")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Hora de inicio</label>
                <input type="time" value={form.hora} onChange={set("hora")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all" />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-600 mb-1">Laboratorio</label>
                <select value={form.laboratorio} onChange={set("laboratorio")}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-all">
                  <option value="">Seleccionar laboratorio...</option>
                  {LABS?.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-zinc-500 text-sm italic">Seleccionar recursos requeridos e indicar cantidad:</p>
              <div className="grid grid-cols-1 gap-2">
                {RECURSOS_DB.map((r, i) => {
                  const seleccionado = form.recursos.find(rec => rec.nombre === r.nombre);
                  
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
                            {r.nombre} (Disponibles: {r.cantidad})
                          </span>
                          <span className="text-zinc-400 text-xs">{r.tipo}</span>
                        </div>
                      </label>

                      {/* Lado Derecho: Input de cantidad (solo aparece si está tildado) */}
                      {seleccionado && (
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-zinc-500 font-medium">Cant:</span>
                          <input 
                            type="number" 
                            min="1" 
                            max={r.cantidad}
                            value={seleccionado.cantidad} 
                            onChange={(e) => actualizarCantidad(r.nombre, e.target.value)}
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
                ["Docente", form.docente || "—"],
                ["Alumnos", form.alumnos || "—"],
                ["Fecha y hora", form.fecha ? `${form.fecha} ${form.hora}` : "—"],
                ["Laboratorio", form.laboratorio || "—"],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between border-b border-zinc-200/60 py-2 last:border-0">
                  <span className="text-zinc-500 text-sm">{k}</span>
                  <span className="text-zinc-800 font-semibold text-sm text-right max-w-[200px]">{v}</span>
                </div>
              ))}
              
              {/* Desglose de recursos en el resumen */}
              <div className="pt-2">
                <span className="text-zinc-500 text-sm block mb-2">Recursos ({form.recursos.length}):</span>
                {form.recursos.map((r, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-1">
                    <span className="text-zinc-600">- {r.nombre}</span>
                    <span className="font-medium text-zinc-800">x{r.cantidad}</span>
                  </div>
                ))}
              </div>
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
            <button onClick={handleCrear}
              className="px-6 py-2 rounded-xl text-sm bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200">
              Cerrar y Finalizar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}